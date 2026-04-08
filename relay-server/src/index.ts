import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { startWebSocketServer, sendToFigma, log, CODE_TIMEOUT_MS } from "./ws.js";

startWebSocketServer();

async function callFigma(type: string, payload?: unknown, timeoutMs?: number) {
  try {
    const result = await sendToFigma(type, payload, timeoutMs);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Error: ${message}` }],
      isError: true,
    };
  }
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------
const mcp = new McpServer(
  { name: "figma-mcp-bridge", version: "2.0.0" },
  { capabilities: { tools: {} } }
);

// ===== Read Tools =====

mcp.tool(
  "get_figma_selection",
  "현재 Figma에서 선택된 레이어의 구조와 속성(CSS, 텍스트, 위치, 크기 등) 데이터를 가져옵니다.",
  async () => callFigma("GET_SELECTION")
);

mcp.tool(
  "get_figma_styles",
  "현재 Figma 파일에 정의된 로컬 스타일(색상, 텍스트, 효과 등) 목록을 가져옵니다.",
  async () => callFigma("GET_STYLES")
);

mcp.tool(
  "get_figma_components",
  "현재 Figma 파일에 정의된 로컬 컴포넌트 목록을 가져옵니다.",
  async () => callFigma("GET_COMPONENTS")
);

mcp.tool(
  "get_node_by_id",
  "ID로 특정 Figma 노드의 상세 정보(구조, CSS, 속성)를 조회합니다.",
  { nodeId: z.string().describe("조회할 노드 ID (예: '9:2')") },
  async ({ nodeId }) => callFigma("GET_NODE_BY_ID", { nodeId })
);

// ===== Write Tools =====

mcp.tool(
  "create_node",
  "Figma에 새 노드를 생성합니다. 프레임, 사각형, 텍스트, 타원, 다각형, 별, 선, 벡터, 컴포넌트, 섹션 등.",
  {
    nodeType: z.enum([
      "FRAME", "RECTANGLE", "ELLIPSE", "LINE", "TEXT",
      "POLYGON", "STAR", "VECTOR", "COMPONENT", "SECTION",
    ]).describe("생성할 노드 타입"),
    properties: z.record(z.string(), z.any()).optional().describe(
      "노드 속성 객체. 예: { name, x, y, width, height, fills, strokes, cornerRadius, opacity, layoutMode, itemSpacing, paddingLeft, ... }"
    ),
    parentId: z.string().optional().describe("부모 노드 ID. 미지정 시 현재 페이지에 추가"),
    textContent: z.string().optional().describe("TEXT 타입일 때 설정할 텍스트 내용"),
    fontName: z.object({
      family: z.string(),
      style: z.string(),
    }).optional().describe("TEXT 타입일 때 사용할 폰트. 기본: { family: 'Inter', style: 'Regular' }"),
  },
  async (args) => callFigma("CREATE_NODE", args)
);

mcp.tool(
  "modify_node",
  "기존 Figma 노드의 속성을 수정합니다. 크기, 위치, 색상, 텍스트 등 모든 속성 변경 가능.",
  {
    nodeId: z.string().describe("수정할 노드 ID"),
    properties: z.record(z.string(), z.any()).optional().describe(
      "변경할 속성 객체. 예: { x, y, width, height, fills, strokes, cornerRadius, opacity, visible, name, ... }"
    ),
    textContent: z.string().optional().describe("텍스트 노드인 경우 변경할 텍스트 내용"),
    fontName: z.object({
      family: z.string(),
      style: z.string(),
    }).optional().describe("텍스트 변경 시 사용할 폰트"),
  },
  async (args) => callFigma("MODIFY_NODE", args)
);

mcp.tool(
  "delete_nodes",
  "Figma 노드를 삭제합니다.",
  {
    nodeIds: z.array(z.string()).describe("삭제할 노드 ID 배열"),
  },
  async ({ nodeIds }) => callFigma("DELETE_NODES", { nodeIds })
);

mcp.tool(
  "export_node",
  "Figma 노드를 이미지(PNG, SVG, PDF, JPG)로 내보냅니다. SVG는 문자열, 나머지는 Base64 인코딩으로 반환.",
  {
    nodeId: z.string().describe("내보낼 노드 ID"),
    format: z.enum(["PNG", "SVG", "PDF", "JPG"]).default("PNG").describe("내보내기 형식"),
    scale: z.number().default(1).describe("스케일 배율 (1 = 1x, 2 = 2x). PNG/JPG에만 적용"),
  },
  async (args) => callFigma("EXPORT_NODE", args)
);

// ===== Universal Tool =====

mcp.tool(
  "run_figma_code",
  `Figma Plugin API를 사용하여 임의의 JavaScript 코드를 실행합니다.
figma 전역 객체를 통해 모든 Figma Plugin API에 접근 가능합니다.
async/await 사용 가능. 결과를 return으로 반환하세요.

예시:
- return figma.currentPage.name
- const rect = figma.createRectangle(); rect.resize(200, 100); rect.fills = [{type:'SOLID', color:{r:1,g:0,b:0}}]; return rect.id
- const nodes = figma.currentPage.findAll(n => n.type === 'TEXT'); return nodes.map(n => ({id: n.id, name: n.name, characters: n.characters}))
- const vars = await figma.variables.getLocalVariablesAsync(); return vars.map(v => ({id: v.id, name: v.name, resolvedType: v.resolvedType}))
- await figma.loadFontAsync({family:'Inter',style:'Regular'}); const t = figma.createText(); t.characters = 'Hello'; return t.id`,
  {
    code: z.string().describe("실행할 JavaScript 코드 (figma 전역 객체 사용 가능, async/await 지원, return으로 결과 반환)"),
  },
  async ({ code }) => callFigma("RUN_CODE", { code }, CODE_TIMEOUT_MS)
);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
async function main() {
  const transport = new StdioServerTransport();
  await mcp.connect(transport);
  log("MCP server connected via stdio");
}

main().catch((err) => {
  log(`Fatal: ${err.message}`);
  process.exit(1);
});
