#!/usr/bin/env node
// 이 파일이 하는 일(한줄 요약)
// - 터미널에서 "node figma-cli.js status" 처럼 치면, 그 말을 컴퓨터가 이해하는 주소(HTTP)로 바꿔
//   "집 PC에서 돌아가는 Figma 연결 서버"에 전달하고, Figma(플러그인) 쪽에서 실제 캔버스 작업이 일어납니다.
// - 즉, 이 스크립트는 "Figma를 직접 만지는 프로그램"이 아니라, **명령을 정리해 서버에 보내는 창구**입니다.
// - 결과는 JSON으로 터미널에 찍힙니다(디자인 데이터를 텍스트로 보는 느낌).
"use strict";

const fs = require("fs");
const path = require("path");

// Figma HTTP 서버 주소(기본: 내 컴퓨터 3000번 포트). 회사/집마다 다르면 FIGMA_API 환경변수로 바꿀 수 있음
const BASE_URL = process.env.FIGMA_API || "http://localhost:3000";

// ---------------------------------------------------------------------------
// HTTP helpers — "서버에 주문 보내기"
// ---------------------------------------------------------------------------

// --timeout 을 쓰면 기다릴 수 있는 최대 시간(ms)을 기억해 둠(느린 작업/대용량 export 등)
let globalTimeout = null;

// method: GET(가져와줘) / POST(이 데이터로 작업해줘)
// urlPath: /api/... 처럼 서버가 정해 둔 메뉴 번호
// body: JSON으로 보낼 내용(없으면 undefined)
async function api(method, urlPath, body) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  if (globalTimeout) {
    opts.signal = AbortSignal.timeout(globalTimeout + 5000);
  }
  const res = await fetch(`${BASE_URL}${urlPath}`, opts);
  const data = await res.json();
  // 200대가 아니면(실패) 서버가 보낸 error 메시지를 터미널에 붉게/JSON으로
  if (!res.ok) {
    const msg = data.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// 주소 뒤에 ?timeout=... 을 붙일 때, 이미 ?가 있으면 &를 써서 깨지지 않게 정리
function appendTimeout(qs) {
  if (!globalTimeout) return qs;
  return qs + (qs.includes("?") ? "&" : "?") + `timeout=${globalTimeout}`;
}

// POST /api/run_code 같은 곳에 --timeout 을 body에 끼워 넣을 때 사용
function withTimeout(body) {
  if (!globalTimeout) return body;
  return { ...body, timeout: globalTimeout };
}

// ---------------------------------------------------------------------------
// Color conversion — "디자이너가 쓰는 #RRGGBB 를 Figma API가 쓰는 0~1 숫자로"
// (피그마 플러그인 API 쪽이 색을 소수로 받는 경우가 많음)
// ---------------------------------------------------------------------------

function hexToRgb(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length === 8) {
    return {
      r: parseInt(hex.slice(0, 2), 16) / 255,
      g: parseInt(hex.slice(2, 4), 16) / 255,
      b: parseInt(hex.slice(4, 6), 16) / 255,
      a: parseInt(hex.slice(6, 8), 16) / 255,
    };
  }
  return {
    r: parseInt(hex.slice(0, 2), 16) / 255,
    g: parseInt(hex.slice(2, 4), 16) / 255,
    b: parseInt(hex.slice(4, 6), 16) / 255,
  };
}

// ---------------------------------------------------------------------------
// Flag parser — "명령 뒤에 붙는 --이름 값"을 표로 바꾸기
// 예: --name "카드" --w 320  →  { name: "카드", w: "320" }
// ---------------------------------------------------------------------------

function parseFlags(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith("--")) continue;
    const key = args[i].slice(2);
    const next = args[i + 1];
    if (next === undefined || next.startsWith("--")) {
      flags[key] = true;
    } else {
      flags[key] = next;
      i++;
    }
  }
  return flags;
}

// create / modify 에서 --fill, --w 처럼 말로 적은 옵션을, 서버가 알아듣는 "노드 속성" 맵으로 모음
function buildNodePayload(flags) {
  const props = {};
  if (flags.name) props.name = flags.name;
  if (flags.w) props.width = Number(flags.w);
  if (flags.h) props.height = Number(flags.h);
  if (flags.x) props.x = Number(flags.x);
  if (flags.y) props.y = Number(flags.y);
  if (flags.radius) props.cornerRadius = Number(flags.radius);
  if (flags.opacity) props.opacity = Number(flags.opacity);
  if (flags.fill) {
    const c = hexToRgb(flags.fill);
    props.fills = [{ type: "SOLID", color: { r: c.r, g: c.g, b: c.b }, opacity: c.a }];
  }
  if (flags.stroke) {
    const c = hexToRgb(flags.stroke);
    props.strokes = [{ type: "SOLID", color: { r: c.r, g: c.g, b: c.b } }];
  }
  if (flags["stroke-weight"]) props.strokeWeight = Number(flags["stroke-weight"]);
  if (flags.visible) props.visible = flags.visible !== "false";
  if (flags.layout) props.layoutMode = flags.layout.toUpperCase();
  if (flags.gap) props.itemSpacing = Number(flags.gap);
  if (flags.padding) {
    const p = Number(flags.padding);
    props.paddingLeft = p;
    props.paddingRight = p;
    props.paddingTop = p;
    props.paddingBottom = p;
  }
  return props;
}

// ---------------------------------------------------------------------------
// Commands — "단어마다 = 서버 메뉴 한 칸" (GET은 조회, POST는 생성/수정/삭제 등)
// ---------------------------------------------------------------------------

const commands = {
  // 연결 잘 됐는지(플러그인+서버 살아있는지) 확인
  async status() {
    return api("GET", "/api/status");
  },

  // 캔버스에서 현재 선택된 레이어 정보 (간단 요약/자세함은 플래그로)
  async selection(args) {
    const flags = parseFlags(args || []);
    let qs = flags.skeleton ? "?skeleton=1" : flags.verbose ? "?verbose=1" : "";
    if (flags.depth) qs += `${qs ? "&" : "?"}depth=${flags.depth}`;
    return api("GET", appendTimeout(`/api/selection${qs}`));
  },

  // 이 파일에 저장된 색/타이포 스타일 목록(로컬 스타일)
  async styles() {
    return api("GET", "/api/styles");
  },

  // 이 파일의 컴포넌트(메인 쪽 컴포넌트) 목록
  async components() {
    return api("GET", "/api/components");
  },

  // 노드 ID(예: 1:23)로 특정 레이어/프레임의 정보 한 덩어리
  async node(args) {
    const id = args[0];
    if (!id) throw new Error("Usage: figma-cli node <nodeId>");
    const flags = parseFlags(args.slice(1));
    let qs = flags.skeleton ? "?skeleton=1" : flags.verbose ? "?verbose=1" : "";
    if (flags.depth) qs += `${qs ? "&" : "?"}depth=${flags.depth}`;
    return api("GET", appendTimeout(`/api/node/${id}${qs}`));
  },

  // 프레임 안의 자식들을 페이지(한 번에 몇 개)로 나눠 가져올 때(큰 구조 열어보기)
  async children(args) {
    const id = args[0];
    if (!id) throw new Error("Usage: figma-cli children <nodeId> [--offset 0 --limit 20 --depth 1]");
    const flags = parseFlags(args.slice(1));
    let qs = `?offset=${flags.offset || 0}&limit=${flags.limit || 20}`;
    if (flags.depth) qs += `&depth=${flags.depth}`;
    if (flags.skeleton) qs += "&skeleton=1";
    return api("GET", appendTimeout(`/api/node/${id}/children${qs}`));
  },

  // FRAME, TEXT 등 타입 + 옵션으로 레이어 새로 만들기
  async create(args) {
    const nodeType = (args[0] || "").toUpperCase();
    if (!nodeType) throw new Error("Usage: figma-cli create <type> [--name ... --w ... --h ...]");
    const flags = parseFlags(args.slice(1));
    const properties = buildNodePayload(flags);
    const payload = { nodeType, properties };
    if (flags.parent) payload.parentId = flags.parent;
    if (flags.text) payload.textContent = flags.text;
    if (flags.font) {
      const parts = flags.font.split("/");
      payload.fontName = { family: parts[0], style: parts[1] || "Regular" };
    }
    return api("POST", "/api/create_node", payload);
  },

  // 이미 있는 노드의 속성 바꾸기(이름, 크기, 색 등)
  async modify(args) {
    const nodeId = args[0];
    if (!nodeId) throw new Error("Usage: figma-cli modify <nodeId> [--name ... --w ...]");
    const flags = parseFlags(args.slice(1));
    const properties = buildNodePayload(flags);
    const payload = { nodeId, properties };
    if (flags.text) payload.textContent = flags.text;
    if (flags.font) {
      const parts = flags.font.split("/");
      payload.fontName = { family: parts[0], style: parts[1] || "Regular" };
    }
    return api("POST", "/api/modify_node", payload);
  },

  // 노드 ID 여러 개를 한 번에 삭제(주의: 되돌리기는 Figma 쪽)
  async delete(args) {
    if (args.length === 0) throw new Error("Usage: figma-cli delete <id> [<id> ...]");
    return api("POST", "/api/delete_nodes", { nodeIds: args });
  },

  // 캔버스 일부를 PNG/SVG 등으로 뽑기(이미지 자산)
  async export(args) {
    const nodeId = args[0];
    if (!nodeId) throw new Error("Usage: figma-cli export <nodeId> [--format png --scale 2]");
    const flags = parseFlags(args.slice(1));
    return api("POST", "/api/export_node", {
      nodeId,
      format: (flags.format || "PNG").toUpperCase(),
      scale: flags.scale ? Number(flags.scale) : 1,
    });
  },

  // .js 파일 안의 "Figma Plugin API" 코드를 실행(복잡한 일은 이쪽으로)
  async run(args) {
    const filePath = args[0];
    if (!filePath) throw new Error("Usage: figma-cli run <file.js>");
    const code = fs.readFileSync(path.resolve(filePath), "utf-8");
    return api("POST", "/api/run_code", withTimeout({ code }));
  },

  // operations.json: 여러 작업을 한 번에(대량/반복)
  async batch(args) {
    const filePath = args[0];
    if (!filePath) throw new Error("Usage: figma-cli batch <operations.json>");
    const raw = fs.readFileSync(path.resolve(filePath), "utf-8");
    const operations = JSON.parse(raw);
    return api("POST", "/api/batch", { operations: Array.isArray(operations) ? operations : operations.operations });
  },

  // 짧은 코드를 문자열로 바로 실행(빠른 확인용, 길면 run 사용 권장)
  async eval(args) {
    const code = args.join(" ");
    if (!code) throw new Error("Usage: figma-cli eval <code>");
    return api("POST", "/api/run_code", withTimeout({ code }));
  },

  // /templates/*.js "틀"에 --제목 --너비 같은 값을 끼워 넣고, 그 결과를 코드 실행으로 Figma에 반영
  async template(args) {
    const name = args[0];
    // 이 프로젝트의 templates 폴더(카드, 버튼 UI 등 프리셋)
    const tplDir = path.join(__dirname, "templates");

    if (!name || name === "--list") {
      if (!fs.existsSync(tplDir)) return { templates: [] };
      const files = fs.readdirSync(tplDir).filter(f => f.endsWith(".js")).map(f => f.replace(".js", ""));
      return { templates: files };
    }

    const flags = parseFlags(args.slice(1));
    const tplPath = path.join(tplDir, `${name}.js`);

    if (!fs.existsSync(tplPath)) {
      const avail = fs.existsSync(tplDir)
        ? fs.readdirSync(tplDir).filter(f => f.endsWith(".js")).map(f => f.replace(".js", ""))
        : [];
      throw new Error(`Template "${name}" not found. Available: ${avail.join(", ")}`);
    }

    let code = fs.readFileSync(tplPath, "utf-8");
    // {{title}} 처럼 틀에 박힌 자리에 CLI에서 준 --title 값을 안전히 문자열로 끼워 넣기
    code = code.replace(/\{\{(\w+)(?:\|([^}]*))?\}\}/g, (_match, param, defaultVal) => {
      const val = flags[param];
      if (val !== undefined) return String(val).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
      if (defaultVal !== undefined) return defaultVal;
      throw new Error(`Missing required parameter: --${param}`);
    });

    return api("POST", "/api/run_code", withTimeout({ code }));
  },
  // 페이지 목록 / 다른 페이지로 전환 / 생성 / 삭제(파일이 아니라 "캔버스 시트" 단위)
  async pages(args) {
    const sub = args[0];
    if (!sub || sub === "list") return api("GET", appendTimeout("/api/pages"));
    // 123:456 형식이면 ID로, 아니면 페이지 이름으로 이해
    const isFigmaId = (s) => /^\d+:\d+$/.test(s);
    if (sub === "switch") {
      const target = args[1];
      if (!target) throw new Error("Usage: figma-cli pages switch <name|id>");
      const payload = isFigmaId(target) ? { id: target } : { name: target };
      return api("POST", "/api/pages/switch", payload);
    }
    if (sub === "create") {
      const name = args[1] || "New Page";
      return api("POST", "/api/pages/create", { name });
    }
    if (sub === "delete") {
      const target = args[1];
      if (!target) throw new Error("Usage: figma-cli pages delete <name|id>");
      const payload = isFigmaId(target) ? { id: target } : { name: target };
      return api("POST", "/api/pages/delete", payload);
    }
    throw new Error("Usage: figma-cli pages [list|switch|create|delete]");
  },

  // Variables: 디자인 토큰(색, 숫자, 불리언) 목록/컬렉션, 새로 만들기, 노드에 연결
  async vars(args) {
    const sub = args[0];
    if (!sub || sub === "list") return api("GET", appendTimeout("/api/vars"));
    if (sub === "collections") return api("GET", appendTimeout("/api/vars/collections"));
    if (sub === "create") {
      const flags = parseFlags(args.slice(1));
      if (!flags.name) throw new Error("Usage: figma-cli vars create --name <name> [--collection <id>] [--type COLOR] [--value ...]");
      const payload = {
        name: flags.name,
        collectionId: flags.collection || undefined,
        resolvedType: (flags.type || "COLOR").toUpperCase(),
      };
      if (flags.value !== undefined) {
        const v = String(flags.value);
        if (v.startsWith("#")) {
          payload.value = hexToRgb(v);
        } else if (v === "true") {
          payload.value = true;
        } else if (v === "false") {
          payload.value = false;
        } else if (!isNaN(Number(v))) {
          payload.value = Number(v);
        } else {
          payload.value = v;
        }
      }
      return api("POST", "/api/vars/create", payload);
    }
    if (sub === "bind") {
      const flags = parseFlags(args.slice(1));
      if (!flags.node || !flags.field || !flags.var) {
        throw new Error("Usage: figma-cli vars bind --node <id> --field fills --var <varId>");
      }
      return api("POST", "/api/vars/bind", {
        nodeId: flags.node,
        field: flags.field,
        variableId: flags.var,
      });
    }
    throw new Error("Usage: figma-cli vars [list|collections|create|bind]");
  },

  // 캔버스 주석(라벨/메모) 달기(또는 --label 없이 GET 으로 읽기)
  async annotate(args) {
    const nodeId = args[0];
    if (!nodeId) throw new Error("Usage: figma-cli annotate <nodeId> --label \"text\"");
    const flags = parseFlags(args.slice(1));
    if (flags.label) {
      return api("POST", "/api/annotations", { nodeId, label: flags.label });
    }
    return api("GET", appendTimeout(`/api/annotations/${nodeId}`));
  },

  // 한 노드에 달린 주석들만 조회
  async annotations(args) {
    const nodeId = args[0];
    if (!nodeId) throw new Error("Usage: figma-cli annotations <nodeId>");
    return api("GET", appendTimeout(`/api/annotations/${nodeId}`));
  },
};

// 짧은 별칭(같은 기능을 selection 말고 sel 로도 호출)
commands.sel = commands.selection;
commands.comps = commands.components;
commands.tpl = commands.template;

// ---------------------------------------------------------------------------
// Help — --help / 잘못된 명령일 때 콘솔에 쓰는 사용 설명(영어 텍스트)
// ---------------------------------------------------------------------------

function printHelp() {
  const help = `
figma-cli — Figma Bridge CLI (no JSON escaping needed)

USAGE
  node figma-cli.js <command> [args]

COMMANDS
  status                                Check Figma connection
  selection | sel [--skeleton|--verbose] [--depth N]
                                        Get selected layers
  styles                                Get local styles
  components | comps                    Get local components
  node <id> [--skeleton|--verbose] [--depth N]
                                        Get node by ID
  children <id> [--offset 0] [--limit 20] [--depth 1]
                                        Get children with pagination

  create <TYPE> [flags]                 Create a node
    --name  --w  --h  --x  --y  --fill "#hex"  --radius  --parent <id>
    --text "content"  --font "Family/Style"  --layout vertical  --gap  --padding

  modify <id> [flags]                   Modify a node (same flags as create)
  delete <id> [<id> ...]                Delete nodes
  export <id> [--format png --scale 2]  Export as image

  pages [list|switch|create|delete]      Manage pages
  vars [list|collections|create|bind]   Manage variables
  annotate <id> --label "text"          Add annotation to node
  annotations <id>                      Read annotations from node

  run <file.js>                         Execute Figma Plugin API code from file
  eval <code>                           Execute inline code (simple expressions)
  batch <file.json>                     Run batch operations from JSON file

  template | tpl <name> [flags]         Create UI from template
    card   --title --desc --button --w --parent
    button --text --variant(primary|secondary|outline) --size(sm|md|lg)
    input  --label --placeholder --w --parent
    list   --items "a,b,c" --w --parent
    navbar --title --items "Home,About" --w
    table  --cols "Name,Email" --rows "John,john@..." --w
    create-instance --componentId <id> [--parentId <id>]
    set-reactions --sourceId <id> --destId <id> [--trigger --transition --duration]
    boolean-ops --ids "id1,id2" [--op UNION|SUBTRACT|INTERSECT|EXCLUDE]
    create-style --name "Brand/Primary" [--color "#3B82F6"]

GLOBAL FLAGS
  --timeout <ms>                        Override request timeout (default: 30000)

ENVIRONMENT
  FIGMA_API    Base URL (default: http://localhost:3000)

EXAMPLES
  node figma-cli.js status
  node figma-cli.js selection
  node figma-cli.js create FRAME --name "Card" --w 320 --h 200 --fill "#1a1a2e"
  node figma-cli.js create TEXT --text "Hello" --font "Inter/Bold" --parent "1:23"
  node figma-cli.js run ./scripts/build-card.js
  node figma-cli.js batch ./scripts/create-grid.json
  node figma-cli.js eval "return figma.currentPage.name"
`;
  console.log(help.trim());
}

// ---------------------------------------------------------------------------
// Main — "터미널이 넘긴 한 줄"을 읽고, 위 commands 중 하나로 연결
// ---------------------------------------------------------------------------

async function main() {
  // node, figma-cli.js 를 뺀 나머지 = 사용자가 타이핑한 단어들
  const rawArgs = process.argv.slice(2);

  // 전역 --timeout 60000 은 먼저 떼 내고(아래 cmd 와 섞이지 않게) 나중 요청에만 적용
  const timeoutIdx = rawArgs.indexOf("--timeout");
  if (timeoutIdx !== -1 && rawArgs[timeoutIdx + 1]) {
    globalTimeout = parseInt(rawArgs[timeoutIdx + 1], 10);
    rawArgs.splice(timeoutIdx, 2);
  }

  // 첫 단어 = 명령어 이름, 나머지 = 그 명령에 넘기는 인자(노드 ID, 플래그들)
  const [cmd, ...args] = rawArgs;

  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
    printHelp();
    return;
  }

  // commands 표에서 해당 함수 찾기; 없으면 오류
  const handler = commands[cmd];
  if (!handler) {
    console.error(`Unknown command: ${cmd}\n`);
    printHelp();
    process.exit(1);
  }

  // 서버 응답을 사람이 읽기 쉬운 JSON 형태로 터미널에 출력
  const result = await handler(args);
  console.log(JSON.stringify(result, null, 2));
}

// 예기치 못한 오류도 JSON 한 줄로 정리(자동화 도구가 파싱하기 쉽게)
main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
