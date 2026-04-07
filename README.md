# Figma ↔ VS Code MCP Bridge

로컬 WebSocket 기반의 Figma–VS Code 브릿지 서버입니다.  
단일 Node.js 프로세스가 **MCP Server (stdio)** 와 **WebSocket Server** 를 동시에 구동하여,  
VS Code AI Extension(Cline, Roo Code 등)이 Figma 디자인 데이터를 **읽고 쓸 수** 있게 합니다.

```
VS Code (AI)  ─stdio─▶  [Relay Server]  ─WebSocket─▶  Figma Plugin
                                ◀────────────────────────────┘
```

---

## 프로젝트 구조

```
figma-mcp-bridge/
├── relay-server/          # Node.js Relay (MCP + WS)
│   ├── src/index.ts       # 메인 서버 코드
│   ├── tsconfig.json
│   └── package.json
├── figma-plugin/          # Figma Plugin
│   ├── manifest.json      # Figma Plugin 매니페스트
│   ├── code.ts            # Plugin main (Figma API)
│   ├── code.js            # 빌드 결과물
│   ├── ui.html            # Plugin UI (WebSocket 클라이언트)
│   ├── tsconfig.json
│   └── package.json
└── README.md
```

---

## 빠른 시작

### 1. Relay Server 빌드 및 실행

```bash
cd relay-server
npm install
npm run build
```

서버는 **MCP 클라이언트가 stdio로 기동**합니다.  
직접 테스트하려면 `npm start`로 실행할 수 있습니다 (stdin/stdout으로 MCP 프로토콜 통신).

### 2. VS Code MCP 설정

사용 중인 AI Extension의 MCP 서버 설정에 아래를 추가합니다.

#### Cline / Roo Code (`mcp_settings.json`)

```json
{
  "mcpServers": {
    "figma-bridge": {
      "command": "node",
      "args": ["/절대경로/figma-mcp-bridge/relay-server/dist/index.js"],
      "env": {
        "WS_PORT": "8080"
      }
    }
  }
}
```

#### Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "figma-bridge": {
      "command": "node",
      "args": ["/절대경로/figma-mcp-bridge/relay-server/dist/index.js"],
      "env": {
        "WS_PORT": "8080"
      }
    }
  }
}
```

### 3. Figma Plugin 설치

```bash
cd figma-plugin
npm install
npm run build
```

1. Figma Desktop → **Plugins → Development → Import plugin from manifest…**
2. `figma-plugin/manifest.json` 선택
3. 플러그인 실행 → UI에서 **연결** 버튼 클릭 (자동 연결 시도)

---

## 제공되는 MCP Tools

### 읽기 (Read)

| Tool 이름 | 설명 |
|---|---|
| `get_figma_selection` | 현재 Figma에서 선택된 레이어의 구조, CSS, 텍스트, 위치, 크기 등 속성 데이터 조회 |
| `get_figma_styles` | 현재 파일의 로컬 스타일(Paint, Text, Effect) 목록 조회 |
| `get_figma_components` | 현재 페이지의 컴포넌트 목록 조회 |
| `get_node_by_id` | ID로 특정 노드의 상세 정보(구조, CSS, 속성) 조회 |

### 쓰기 (Write)

| Tool 이름 | 설명 |
|---|---|
| `create_node` | 새 노드 생성 (Frame, Rectangle, Text, Ellipse, Polygon, Star, Line, Vector, Component, Section) |
| `modify_node` | 기존 노드의 속성 수정 (크기, 위치, 색상, 텍스트, 스타일 등) |
| `delete_nodes` | 노드 삭제 |
| `export_node` | 노드를 이미지로 내보내기 (PNG, SVG, PDF, JPG) |

### 범용 (Universal)

| Tool 이름 | 설명 |
|---|---|
| `run_figma_code` | Figma Plugin API를 사용하여 임의의 JavaScript 코드 실행. `figma` 전역 객체 접근, async/await 지원. 위 도구로 커버되지 않는 모든 Figma 기능 사용 가능 |

#### `run_figma_code` 사용 예시

```javascript
// 현재 페이지 이름 가져오기
return figma.currentPage.name

// 빨간 사각형 생성
const rect = figma.createRectangle();
rect.resize(200, 100);
rect.fills = [{type: 'SOLID', color: {r: 1, g: 0, b: 0}}];
return rect.id

// 모든 텍스트 노드 검색
const nodes = figma.currentPage.findAll(n => n.type === 'TEXT');
return nodes.map(n => ({id: n.id, name: n.name, characters: n.characters}))

// 로컬 변수 조회
const vars = await figma.variables.getLocalVariablesAsync();
return vars.map(v => ({id: v.id, name: v.name, resolvedType: v.resolvedType}))

// Auto Layout 프레임 생성
const frame = figma.createFrame();
frame.layoutMode = 'VERTICAL';
frame.primaryAxisSizingMode = 'AUTO';
frame.counterAxisSizingMode = 'AUTO';
frame.itemSpacing = 16;
frame.paddingLeft = frame.paddingRight = frame.paddingTop = frame.paddingBottom = 24;
return frame.id
```

---

## 환경 변수

| 변수 | 기본값 | 설명 |
|---|---|---|
| `WS_PORT` | `8080` | WebSocket 서버 포트 |
| `REQUEST_TIMEOUT_MS` | `10000` | 일반 요청 Figma 응답 타임아웃 (ms) |
| `CODE_TIMEOUT_MS` | `30000` | `run_figma_code` 전용 타임아웃 (ms) |

---

## 에러 처리

- **Figma 미연결:** 플러그인 미실행 또는 WebSocket 미연결 시 명확한 한국어 에러 메시지 반환
- **Timeout:** 일반 요청 10초, 코드 실행 30초(기본값) 내 응답 없으면 자동 reject
- **자동 재연결:** 플러그인 UI에서 3초 간격으로 자동 재연결 시도

---

## 메시지 프로토콜

### Read 요청

| Request Type | Response Type | 설명 |
|---|---|---|
| `GET_SELECTION` | `SELECTION_RESULT` | 선택된 레이어 데이터 |
| `GET_STYLES` | `STYLES_RESULT` | 로컬 스타일 목록 |
| `GET_COMPONENTS` | `COMPONENTS_RESULT` | 컴포넌트 목록 |
| `GET_NODE_BY_ID` | `NODE_RESULT` | 특정 노드 상세 정보 |

### Write 요청

| Request Type | Response Type | 설명 |
|---|---|---|
| `CREATE_NODE` | `CREATE_RESULT` | 노드 생성 |
| `MODIFY_NODE` | `MODIFY_RESULT` | 노드 수정 |
| `DELETE_NODES` | `DELETE_RESULT` | 노드 삭제 |
| `EXPORT_NODE` | `EXPORT_RESULT` | 이미지 내보내기 |
| `RUN_CODE` | `CODE_RESULT` | 임의 코드 실행 |

### 메시지 형식

```json
// Request (Relay → Figma)
{
  "messageId": "uuid",
  "type": "GET_SELECTION" | "CREATE_NODE" | "RUN_CODE" | ...,
  "payload": {}
}

// Response (Figma → Relay)
{
  "messageId": "uuid",
  "type": "SELECTION_RESULT" | "CREATE_RESULT" | "CODE_RESULT" | ...,
  "payload": { ... }
}
```
