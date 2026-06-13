# Figma ↔ AI Bridge (MCP + HTTP)

로컬 WebSocket 기반의 Figma–AI 브릿지 서버입니다.  
**MCP 모드**(Claude Code)와 **HTTP 모드**(MCP 차단 환경)를 모두 지원하며,  
AI 에이전트가 Figma 디자인 데이터를 **읽고 쓸 수** 있게 합니다.

```
Mode A: MCP (권장)
┌──────────────┐    stdio     ┌───────────────┐   WebSocket    ┌──────────────┐
│  Claude Code │ ◀──────────▶ │  Relay Server │ ◀────────────▶ │  Figma       │
│  (AI)        │   MCP 프로토콜 │  (Node.js)    │   ws://8080    │  (Plugin)    │
└──────────────┘              └───────────────┘                └──────────────┘

Mode B: HTTP + CLI (MCP 차단 환경 / 자동화 스크립트)
┌──────────────┐   shell cmd  ┌───────────────┐   HTTP     ┌───────────────┐   WebSocket   ┌──────────────┐
│  AI / Shell  │ ──────────▶ │  figma-cli.js │ ────────▶ │  HTTP Server  │ ◀───────────▶ │  Figma       │
│              │   stdout     │  (CLI 래퍼)    │  :3000     │  (Express)    │   ws://8080   │  (Plugin)    │
└──────────────┘              └───────────────┘            └───────────────┘               └──────────────┘
```

> **Claude Code 전용 하네스 포함**: 프로젝트 루트의 `CLAUDE.md`(상시 규칙)와 `.claude/skills/`(도메인 스킬·워크플로우)가 Claude Code에 맞춰 구성되어 있습니다. 자세한 설정은 [Mode A: MCP 모드](#mode-a-mcp-모드-claude-code) 참고.

---

## 빠른 시작 (Quick Start)

> 사전 요구사항: **Node.js v18 이상**, **Figma Desktop 앱**

### 방법 1 — 릴리즈 zip 받기 (권장)

1. [GitHub Releases](../../releases) 에서 최신 `figma-mcp-bridge-vX.X.X.zip` 다운로드
2. 압축 해제
3. `start.command` **더블클릭** (터미널이 열리고 서버가 자동 시작됩니다)
4. **Figma Desktop** → `Plugins` → `Development` → **Import plugin from manifest…**
5. 방금 압축 해제한 폴더의 **`figma-plugin/manifest.json`** 선택
6. `Plugins` → `Development` → **MCP Bridge** 실행
7. 플러그인 UI에 🟢 **연결됨** 표시 확인 → 완료!

### 방법 2 — 직접 클론해서 실행

```bash
git clone https://github.com/Junhyeok-Yi/figma-mcp-bridge.git
cd figma-mcp-bridge
./start.command   # 의존성 설치 + 빌드 + 서버 시작 한 번에
```

이후 피그마 플러그인 등록 과정은 방법 1의 4~7번 단계와 동일합니다.

### 릴리즈 zip 직접 만들기 (새 버전 배포 시)

```bash
./make-release.sh 1.2.0
# → figma-mcp-bridge-v1.2.0.zip 생성
```

또는 `v1.2.0` 태그를 push하면 GitHub Actions가 자동으로 릴리즈를 만듭니다:

```bash
git tag v1.2.0 && git push origin v1.2.0
```

---

## 목차

- [빠른 시작](#빠른-시작-quick-start)
- [사전 요구사항](#사전-요구사항)
- [설치 가이드](#설치-가이드)
- [Mode A: MCP 모드 (Claude Code)](#mode-a-mcp-모드-claude-code)
- [Mode B: HTTP + CLI 모드](#mode-b-http--cli-모드-mcp-차단-환경)
- [CLI 사용법](#cli-사용법)
- [Compact 응답 모드](#compact-응답-모드)
- [Design System](#design-system)
- [Claude Code 하네스](#claude-code-하네스-claudemd--skills)
- [제공되는 MCP Tools](#제공되는-mcp-tools)
- [트러블슈팅](#트러블슈팅)
- [환경 변수](#환경-변수)
- [프로젝트 구조](#프로젝트-구조)

---

## 사전 요구사항

| 항목 | 최소 버전 | 확인 방법 |
|---|---|---|
| **Node.js** | v18 이상 | `node --version` |
| **npm** | v9 이상 | `npm --version` |
| **Figma Desktop** | 최신 | Figma 앱 실행 필요 (웹 버전은 WebSocket 제한) |
| **Claude Code** | 최신 | MCP 모드 사용 (`.mcp.json` 자동 등록) |

---

## 설치 가이드

```bash
# 1. 저장소 클론
git clone https://github.com/Junhyeok-Yi/figma-mcp-bridge.git
cd figma-mcp-bridge

# 2. Relay Server 빌드
cd relay-server
npm install
npm run build
cd ..

# 3. Figma Plugin 의존성 설치
cd figma-plugin
npm install
npm run build
cd ..
```

### Figma Plugin 등록

1. **Figma Desktop** 앱에서: **Plugins → Development → Import plugin from manifest…**
2. `figma-plugin/manifest.json` 파일을 선택
3. **Plugins → Development → MCP Bridge** 로 실행
4. 플러그인 UI에서 🟢 연결됨 확인

---

## Mode A: MCP 모드 (Claude Code)

> **참고 — Mode A는 Phase 0~3 표면(읽기/쓰기/내보내기/`run_figma_code`)으로 구성됩니다.**
> Pages, Variables, Annotations 등은 전용 툴 대신 **`run_figma_code`** 로 모두 처리합니다(임의 Plugin API 실행).

이 저장소는 **Claude Code 전용 하네스**를 포함합니다. 프로젝트를 Claude Code로 열면 자동으로:
- `.mcp.json` — `figma-bridge` MCP 서버를 등록 (아래 9개 툴 노출)
- `CLAUDE.md` — 상시 규칙(연결 전제, `run_figma_code` 사용법, Figma API 함정, memory-bank)
- `.claude/skills/` — 도메인 스킬 + 워크플로우(`/a11y-audit`, `/ux-review`, `/mobile-adapt` 등)

### 설정

프로젝트 루트에 이미 `.mcp.json`이 있습니다 (절대경로만 환경에 맞게 확인):

```json
{
  "mcpServers": {
    "figma-bridge": {
      "command": "node",
      "args": ["/Users/<you>/figma-mcp-bridge/relay-server/dist/index.js"],
      "env": { "WS_PORT": "8080" }
    }
  }
}
```

1. `cd relay-server && npm run build` — `dist/index.js` 빌드 확인
2. Figma Desktop → Plugins → Development → **MCP Bridge** 실행 (🟢 연결됨)
3. WS 8080은 한 relay만 소유 가능 — HTTP 모드 서버가 떠 있으면 끄기 (`lsof -i :8080`)
4. Claude Code 세션 시작 → `figma-bridge` 서버 승인 (프로젝트 MCP는 최초 1회 승인)

### 사용법

자연어로 요청하면 Claude Code가 `mcp__figma-bridge__*` 툴을 호출합니다:

```
"Figma에서 현재 선택된 레이어 정보 가져와"
"320x200 카드 프레임 만들어줘"
"이 프레임 모바일로 전환해줘"   → /mobile-adapt 스킬
"접근성 감사해줘"               → /a11y-audit 스킬
```

> 연결 확인: `run_figma_code`에 `return figma.currentPage.name` → 페이지명 반환되면 정상.

---

## Mode B: HTTP + CLI 모드 (MCP 차단 환경)

회사 등에서 MCP가 차단된 경우, HTTP API + CLI 래퍼로 동일한 기능을 사용합니다.

### 서버 시작

```bash
cd relay-server
npm run start:http
# → WebSocket: ws://localhost:8080
# → HTTP API:  http://localhost:3000
```

### 연결 확인

```bash
# Figma 플러그인이 연결되었는지 확인
node figma-cli.js status
# → {"connected": true}
```

### CLI로 사용

`figma-cli.js`로 Figma를 제어합니다. 자동화 스크립트나 MCP를 쓸 수 없는 환경의 폴백 경로입니다. Claude Code는 기본적으로 Mode A(MCP)를 사용합니다.

---

## CLI 사용법

`figma-cli.js`는 JSON 이스케이프 없이 Figma를 제어하는 CLI 래퍼입니다.

### 읽기 명령

```bash
node figma-cli.js status              # 연결 상태
node figma-cli.js selection           # 선택된 레이어 (compact)
node figma-cli.js styles              # 로컬 스타일
node figma-cli.js components          # 로컬 컴포넌트
node figma-cli.js node 1:23           # 특정 노드 조회
```

### 쓰기 명령

```bash
# 프레임 생성
node figma-cli.js create FRAME --name "Card" --w 320 --h 200 --fill "#1a1a2e"

# 텍스트 생성 (부모 지정)
node figma-cli.js create TEXT --text "Hello" --font "Inter/Bold" --parent "1:23"

# 노드 수정
node figma-cli.js modify 1:23 --name "Updated" --fill "#3B82F6"

# 노드 삭제
node figma-cli.js delete 1:23 1:24

# 이미지 내보내기
node figma-cli.js export 1:23 --format svg --scale 2
```

### 파일 실행 (핵심 기능)

**JSON 이스케이프 문제 완벽 해결.** JS 파일을 작성하고 실행합니다:

```bash
# build-card.js 파일 작성 후:
node figma-cli.js run build-card.js
```

```javascript
// build-card.js — Figma Plugin API 코드
const frame = figma.createFrame();
frame.name = "Card";
frame.resize(320, 200);
frame.layoutMode = "VERTICAL";
frame.paddingLeft = frame.paddingRight = frame.paddingTop = frame.paddingBottom = 16;
frame.itemSpacing = 12;
frame.cornerRadius = 12;
frame.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];

await figma.loadFontAsync({family: "Inter", style: "Bold"});
const title = figma.createText();
title.fontName = {family: "Inter", style: "Bold"};
title.fontSize = 20;
title.characters = "Card Title";
frame.appendChild(title);

return { frameId: frame.id };
```

### 배치 실행

여러 작업을 JSON 파일로 한번에 실행:

```bash
node figma-cli.js batch operations.json
```

```json
[
  {"type": "CREATE_NODE", "payload": {"nodeType": "FRAME", "properties": {"name": "Grid", "width": 800, "height": 600}}},
  {"type": "CREATE_NODE", "payload": {"nodeType": "RECTANGLE", "properties": {"name": "Cell-1", "width": 200, "height": 200, "fills": [{"type": "SOLID", "color": {"r": 1, "g": 0.2, "b": 0.2}}]}}}
]
```

### 인라인 코드 실행

간단한 표현식을 바로 실행:

```bash
node figma-cli.js eval "return figma.currentPage.name"
```

---

## Compact 응답 모드

HTTP 모드에서는 **기본적으로 compact 응답**을 반환하여 LLM 토큰 사용을 최소화합니다.

### Compact vs Verbose 비교

| 항목 | Compact (기본) | Verbose (`--verbose true`) |
|---|---|---|
| 색상 | `"#3B82F6"` | `{"r": 0.231, "g": 0.51, "b": 0.965}` |
| 기본값 | 생략 (visible, opacity 등) | 모든 속성 포함 |
| 패딩 | `[16, 16, 16, 16]` | `paddingLeft: 16, paddingRight: 16, ...` |
| 폰트 | `"Inter/Bold"` | `{"family": "Inter", "style": "Bold"}` |
| CSS | 생략 | 포함 |
| **토큰 절감** | **~63%** | 기준 |

### Depth 제한

깊은 트리 구조에서 토큰 폭발을 방지:

```bash
# depth=0: 자식은 요약(id/name/type)만 반환
node figma-cli.js node 1:23 --depth 0

# depth=2: 2단계까지만 전체 데이터, 이후는 요약
node figma-cli.js node 1:23 --depth 2
```

---

## Design System

`DESIGN.md` 파일에 프로젝트 디자인 토큰이 정의되어 있습니다:

- **Colors**: Primitive + Semantic 색상 팔레트
- **Typography**: Inter 기반 타입 스케일
- **Spacing**: 4px 기반 간격 체계
- **Border Radius**: sm(4) ~ full(9999)
- **Shadows**: sm ~ xl 그림자
- **Component Patterns**: Card, Button, Input, List Item 구조

AI가 디자인 작업 시 이 토큰을 자동으로 참조합니다.  
프로젝트에 맞게 `DESIGN.md`를 수정하여 사용하세요.

---

## Claude Code 하네스 (CLAUDE.md + Skills)

이 저장소는 Claude Code에 맞춘 하네스를 포함합니다. 강한 모델 전제로 **간결하게** 구성하되, 핵심 안전장치(Figma API 함정, memory-bank 연속성)는 유지합니다.

- **`CLAUDE.md`** (프로젝트 루트) — 세션마다 자동 로드되는 상시 규칙:
  - 연결 전제(플러그인 실행, WS 8080 단일 소유), `run_figma_code` 주력 사용법
  - DESIGN.md = SSOT, memory-bank 읽기/자동 갱신
  - Figma Plugin API 함정(resize 순서, FILL은 appendChild 후, 폰트 로드, GROUP/Mask 금지, staging 후 교체)
- **`.claude/skills/`** — 도메인 스킬 + 슬래시 워크플로우:
  - 도메인: `figma-bridge`, `design-system`, `design-quality`, `a11y-guide`, `ux-principles`, `figma-variables`
  - 워크플로우: `/a11y-audit`, `/ux-review`, `/mobile-adapt`, `/register-colors`, `/update-memory-bank`, `/reset-memory-bank`
- **`memory-bank/`** — 세션 간 디자인 작업 상태 유지(도구 비종속). 새 프로젝트 전환 시 `/reset-memory-bank`.

> 권한: `.claude/settings.local.json`은 읽기 툴(`get_*`)만 자동 허용합니다. `run_figma_code`·쓰기 툴은 임의 코드 실행/변경이라 매번 승인받습니다. 프롬프트를 줄이려면 `/permissions`로 직접 추가하세요.

---

## 제공되는 MCP Tools

> MCP 모드에서만 사용 가능합니다. HTTP 모드에서는 동일한 기능이 REST API + CLI로 제공됩니다.
> Claude Code에서는 `mcp__figma-bridge__*` 형태의 deferred 툴로 노출되며, 필요 시 ToolSearch로 스키마가 로드됩니다.

### 읽기

| Tool | 설명 |
|---|---|
| `get_figma_selection` | 선택된 레이어 데이터 |
| `get_figma_styles` | 로컬 스타일 목록 |
| `get_figma_components` | 로컬 컴포넌트 목록 |
| `get_node_by_id` | ID로 노드 상세 조회 |

### 쓰기

| Tool | 설명 |
|---|---|
| `create_node` | 노드 생성 (FRAME, TEXT, RECT 등) |
| `modify_node` | 노드 속성 수정 |
| `delete_nodes` | 노드 삭제 |
| `export_node` | 이미지 내보내기 (PNG/SVG/PDF/JPG) |

### 범용

| Tool | 설명 |
|---|---|
| `run_figma_code` | 임의 Figma Plugin API 코드 실행 |

---

## 트러블슈팅

### 플러그인이 연결되지 않아요

| 원인 | 해결 |
|---|---|
| 서버가 실행되지 않음 | MCP: Claude Code가 `.mcp.json`으로 자동 기동. HTTP: `npm run start:http` 실행 |
| 포트 불일치 | 플러그인 UI 포트 = `WS_PORT` (기본 8080) |
| 포트 사용 중 | `lsof -i :8080` → `kill <PID>` |
| Figma 웹 버전 | **Desktop 앱** 필수 |

### JSON 이스케이프 에러 (HTTP 모드)

**curl 직접 사용 금지.** `figma-cli.js`를 통해 명령을 실행하세요:

```bash
# ❌ curl로 직접 호출 (이스케이프 문제 발생)
curl -X POST -d '{"code":"..."}' http://localhost:3000/api/run_code

# ✅ CLI 래퍼 사용 (이스케이프 문제 없음)
node figma-cli.js run script.js
```

### Timeout 에러

| 원인 | 해결 |
|---|---|
| 플러그인 미연결 | `node figma-cli.js status`로 확인 |
| Figma 백그라운드 | Figma를 포그라운드로 전환 |
| 복잡한 코드 | 요청별 `--timeout 120000` 또는 `CODE_TIMEOUT_MS` 환경변수 증가 |

**요청별 타임아웃 (run/eval/tpl):** CLI의 글로벌 플래그 `--timeout <ms>`가 `/api/run_code` body에도 실립니다. 서버는 `MAX_RUN_TIMEOUT_MS`(기본 5분)로 상한을 둡니다.

```bash
# 무거운 작업만 120초까지 허용
node figma-cli.js --timeout 120000 run heavy-recolor.js
```

### 연결이 자꾸 끊겨요 (회사 방화벽 등)

서버↔플러그인 사이 keep-alive를 끄거나 늦출 수 있습니다.

| 증상 | 시도 |
|---|---|
| WebView ping 호환 문제로 끊김 | 서버 ping 비활성화: `RELAY_WS_PING_MS=0 npm run start:http` |
| 짧은 idle 후 끊김 | 일반 워크플로에서는 그대로 두고, 플러그인 UI의 “연결” 버튼으로 수동 복구 |

### 플러그인 패널을 두 개 열었어요

릴레이는 **단일 클라이언트**만 받습니다. 두 번째 패널은 1008 코드로 거부되고, 그 패널은 자동 재연결을 멈춥니다. 다른 창을 닫고 두 번째 패널의 “연결” 버튼을 다시 누르세요.

### 폰트 에러

텍스트 작업 전 반드시 폰트 로드:

```javascript
await figma.loadFontAsync({family: 'Inter', style: 'Regular'});
```

---

## 환경 변수

| 변수 | 기본값 | 설명 |
|---|---|---|
| `WS_PORT` | `8080` | WebSocket 포트 |
| `HTTP_PORT` | `3000` | HTTP API 포트 (HTTP 모드만) |
| `REQUEST_TIMEOUT_MS` | `30000` | 일반 요청 타임아웃 (ms) |
| `CODE_TIMEOUT_MS` | `60000` | `RUN_CODE` 기본 타임아웃 (ms) |
| `MAX_RUN_TIMEOUT_MS` | `300000` | `/api/run_code` 요청별 타임아웃 상한 (5분) |
| `RELAY_WS_PING_MS` | `15000` | WebSocket ping 주기 (ms). `0`이면 비활성화 |
| `FIGMA_API` | `http://localhost:3000` | CLI가 연결할 HTTP 서버 주소 |

---

## 프로젝트 구조

```
figma-mcp-bridge/
├── relay-server/              # Node.js Relay Server
│   ├── src/
│   │   ├── ws.ts              # WebSocket 공유 모듈 (MCP/HTTP 공통)
│   │   ├── index.ts           # MCP 모드 엔트리포인트 (동결)
│   │   └── http-server.ts     # HTTP 모드 엔트리포인트 (Express)
│   ├── dist/                  # 빌드 결과물
│   ├── tsconfig.json
│   └── package.json
│
├── figma-plugin/              # Figma Plugin
│   ├── manifest.json          # Figma Plugin 매니페스트
│   ├── code.ts                # Plugin main (Figma API 핸들러)
│   ├── code.js                # 빌드 결과물
│   ├── ui.html                # Plugin UI (WebSocket 클라이언트)
│   └── package.json
│
├── templates/                 # 고수준 UI 템플릿 (card-premium, bento-grid, cta-premium 등)
├── scripts/                   # 예제·헬퍼 스크립트 (color-palette, apply-soft-dark 등)
├── docs/                      # 아키텍처 다이어그램 (.drawio)
├── memory-bank/               # AI 세션 간 컨텍스트 유지 파일 (6개)
│
├── figma-cli.js               # CLI 래퍼 (HTTP 모드용, 빌드 불필요)
├── start.command              # macOS 더블클릭 시작 스크립트
├── make-release.sh            # 빌드 + zip 패키징 스크립트
├── .mcp.json                  # Claude Code MCP 서버 등록 (figma-bridge)
├── CLAUDE.md                  # Claude Code 상시 규칙
├── .claude/skills/            # Claude Code 스킬 (도메인 6 + 워크플로우 6)
├── DESIGN.md                  # 디자인 토큰 정의 (SSOT)
└── README.md
```

> **Memory Bank:** AI가 디자인 작업 히스토리를 세션 간 유지하기 위한 노트 폴더입니다.
> 새 디자인 프로젝트를 시작할 때는 `/reset-memory-bank` 스킬을 사용하세요.

### Scripts

```bash
# 서버 시작 (가장 쉬운 방법)
./start.command          # 의존성 확인 + 빌드 + HTTP 서버 실행

# 직접 실행
cd relay-server && npm run start:http   # HTTP 모드 (Mode B, 권장)
cd relay-server && npm run start:mcp    # MCP 모드 (Mode A)

# 빌드
cd relay-server && npm run build
cd figma-plugin && npm run build

# 릴리즈 zip 만들기
./make-release.sh 1.0.0
```

---

## 라이선스

ISC
