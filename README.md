# Figma ↔ VS Code MCP Bridge

로컬 WebSocket 기반의 Figma–VS Code 브릿지 서버입니다.  
단일 Node.js 프로세스가 **MCP Server (stdio)** 와 **WebSocket Server** 를 동시에 구동하여,  
VS Code AI Extension(Cline, Roo Code 등)이 Figma 디자인 데이터를 **읽고 쓸 수** 있게 합니다.

```
┌──────────────┐    stdio     ┌───────────────┐   WebSocket    ┌──────────────┐
│  VS Code     │ ◀──────────▶ │  Relay Server │ ◀────────────▶ │  Figma       │
│  (Cline AI)  │   MCP 프로토콜  │  (Node.js)    │   ws://8080   │  (Plugin)    │
└──────────────┘              └───────────────┘               └──────────────┘
```

---

## 목차

- [사전 요구사항](#사전-요구사항)
- [설치 가이드 (처음부터 끝까지)](#설치-가이드)
- [Cline 설정 (VS Code)](#1-cline--roo-code-설정-vs-code)
- [Figma Plugin 설치](#2-figma-plugin-설치)
- [연결 확인](#3-연결-확인)
- [사용 방법](#사용-방법)
- [제공되는 MCP Tools](#제공되는-mcp-tools)
- [트러블슈팅](#트러블슈팅)
- [환경 변수](#환경-변수)
- [프로젝트 구조](#프로젝트-구조)
- [메시지 프로토콜 (개발자용)](#메시지-프로토콜-개발자용)

---

## 사전 요구사항

| 항목 | 최소 버전 | 확인 방법 |
|---|---|---|
| **Node.js** | v18 이상 | `node --version` |
| **npm** | v9 이상 | `npm --version` |
| **Figma Desktop** | 최신 | Figma 앱 실행 필요 (웹 버전은 WebSocket 제한으로 불가) |
| **VS Code** | 최신 | |
| **Cline 또는 Roo Code** | 최신 | VS Code Extensions에서 설치 |

> **참고:** Figma **웹 버전**에서는 플러그인의 `localhost` WebSocket 연결이 차단될 수 있습니다. **반드시 Figma Desktop 앱**을 사용하세요.

---

## 설치 가이드

### Step 1: 프로젝트 클론 및 빌드

```bash
# 1. 저장소 클론
git clone https://github.com/Junhyeok-Yi/figma-mcp-bridge.git
cd figma-mcp-bridge

# 2. Relay Server 빌드
cd relay-server
npm install
npm run build
cd ..

# 3. Figma Plugin 의존성 설치 (빌드 결과물 code.js는 이미 포함)
cd figma-plugin
npm install
cd ..
```

빌드가 끝나면 `relay-server/dist/index.js`가 생성됩니다. 이 파일의 **절대 경로**를 메모해두세요.

```bash
# 절대 경로 확인
echo "$(pwd)/relay-server/dist/index.js"
# 예: /Users/yourname/figma-mcp-bridge/relay-server/dist/index.js
```

---

### 1. Cline / Roo Code 설정 (VS Code)

#### 설정 파일 위치

Cline의 MCP 서버 설정 파일을 엽니다:

- **Mac:** `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- **Windows:** `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
- **또는** Cline 사이드바 → 하단 MCP Servers 아이콘 → 설정 파일 열기

#### 설정 내용

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

> **중요:** `/절대경로/` 부분을 위에서 확인한 실제 경로로 바꿔주세요.
> 
> Windows 예시: `"args": ["C:\\Users\\yourname\\figma-mcp-bridge\\relay-server\\dist\\index.js"]`

#### Cursor 사용자의 경우

프로젝트 루트 또는 홈 디렉토리에 `.cursor/mcp.json` 파일을 만듭니다:

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

설정 후 **VS Code를 재시작**하거나, Cline에서 MCP 서버를 재시작하세요.

---

### 2. Figma Plugin 설치

1. **Figma Desktop** 앱을 엽니다
2. 아무 파일이나 열고 메뉴에서: **Plugins → Development → Import plugin from manifest…**
3. 클론한 프로젝트의 `figma-plugin/manifest.json` 파일을 선택합니다
4. 플러그인이 등록되면, **Plugins → Development → MCP Bridge** 로 실행합니다

#### 플러그인 UI 설명

```
┌─────────────────────────┐
│ MCP Bridge              │
│                         │
│ 🟢 연결됨 ✓             │  ← 이 상태가 되어야 정상
│                         │
│ [로그 영역]              │  ← 메시지 송수신 로그
│                         │
│ [연결]  [연결 해제]       │
│                         │
│ ws://localhost: [8080]   │  ← 포트 번호 (서버와 일치해야 함)
└─────────────────────────┘
```

- 플러그인 실행 시 `ws://localhost:8080`으로 **자동 연결** 시도합니다
- 연결 실패 시 3초마다 자동 재연결합니다
- 포트 번호가 Relay Server의 `WS_PORT`와 일치해야 합니다 (기본: `8080`)

---

### 3. 연결 확인

모든 셋업이 완료되면 아래 3가지가 연결된 상태여야 합니다:

```
✅ VS Code (Cline)  ──── MCP 연결 ────  Relay Server
✅ Relay Server     ──── WS 연결  ────  Figma Plugin
✅ Figma Plugin UI  ──── 🟢 연결됨 ✓
```

**확인 방법:**

1. **Cline 사이드바** → MCP Servers → `figma-bridge`가 초록색(활성)인지 확인
2. **Figma 플러그인 UI** → 상태 표시등이 🟢(초록색)인지 확인
3. Cline에게 말해보세요: _"Figma에서 현재 선택된 레이어 정보 가져와"_

---

## 사용 방법

### 기본 사용 흐름

1. **Figma Desktop**에서 작업할 파일을 엽니다
2. **MCP Bridge 플러그인**을 실행합니다 (Plugins → Development → MCP Bridge)
3. 플러그인 UI에서 🟢 연결됨 확인
4. **VS Code Cline**에서 자연어로 Figma를 제어합니다

### 자연어 명령 예시

Cline에게 이렇게 말할 수 있습니다:

#### 읽기

```
"Figma에서 현재 선택된 레이어 정보 가져와"
"Figma 파일의 스타일 목록 보여줘"
"Figma 컴포넌트 목록 조회해줘"
```

#### 쓰기

```
"Figma에 320x200 크기의 파란색 카드 프레임 만들어줘"
"방금 만든 카드에 'Hello World' 텍스트 추가해줘"
"그 노드의 배경색을 빨간색으로 바꿔줘"
"ID가 9:2인 노드를 PNG로 내보내줘"
"방금 만든 테스트 노드 삭제해줘"
```

#### 고급

```
"Figma에서 모든 텍스트 노드를 찾아서 리스트 보여줘"
"Auto Layout으로 된 카드 컴포넌트 만들어줘"
"현재 페이지의 로컬 변수(Variables) 조회해줘"
"선택된 프레임을 SVG로 내보내줘"
```

---

## 제공되는 MCP Tools

### 읽기 (Read)

| Tool 이름 | 설명 | 파라미터 |
|---|---|---|
| `get_figma_selection` | 현재 선택된 레이어의 구조, CSS, 텍스트, 위치, 크기 등 속성 데이터 조회 | 없음 |
| `get_figma_styles` | 현재 파일의 로컬 스타일(Paint, Text, Effect) 목록 조회 | 없음 |
| `get_figma_components` | 현재 페이지의 컴포넌트 목록 조회 | 없음 |
| `get_node_by_id` | ID로 특정 노드의 상세 정보(구조, CSS, 속성) 조회 | `nodeId` |

### 쓰기 (Write)

| Tool 이름 | 설명 | 주요 파라미터 |
|---|---|---|
| `create_node` | 새 노드 생성 | `nodeType`, `properties`, `parentId`, `textContent`, `fontName` |
| `modify_node` | 기존 노드의 속성 수정 | `nodeId`, `properties`, `textContent`, `fontName` |
| `delete_nodes` | 노드 삭제 | `nodeIds` (배열) |
| `export_node` | 노드를 이미지로 내보내기 | `nodeId`, `format` (PNG/SVG/PDF/JPG), `scale` |

#### `create_node` 지원 타입

`FRAME`, `RECTANGLE`, `ELLIPSE`, `LINE`, `TEXT`, `POLYGON`, `STAR`, `VECTOR`, `COMPONENT`, `SECTION`

#### `modify_node` 변경 가능 속성 예시

`name`, `x`, `y`, `width`, `height`, `fills`, `strokes`, `cornerRadius`, `opacity`, `visible`, `layoutMode`, `itemSpacing`, `paddingLeft/Right/Top/Bottom` 등 Figma Plugin API가 지원하는 모든 속성

### 범용 (Universal)

| Tool 이름 | 설명 |
|---|---|
| `run_figma_code` | Figma Plugin API를 사용하여 **임의의 JavaScript 코드 실행**. `figma` 전역 객체 접근, async/await 지원. 위 도구로 커버되지 않는 모든 Figma 기능 사용 가능 |

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

// 특정 노드 찾아서 속성 변경
const node = await figma.getNodeByIdAsync('9:2');
if (node && node.type !== 'DOCUMENT' && node.type !== 'PAGE') {
  node.name = '새 이름';
  node.opacity = 0.5;
}
return 'done'

// Boolean Operation으로 노드 합치기
const union = figma.union([nodeA, nodeB], figma.currentPage);
return union.id
```

> `run_figma_code`는 [Figma Plugin API](https://www.figma.com/plugin-docs/) 의 모든 기능을 사용할 수 있습니다.  
> Variables, Auto Layout, Boolean Operation, Style 생성, Component 조작 등 전부 가능합니다.

---

## 트러블슈팅

### 플러그인이 연결되지 않아요 (🔴 연결 안됨)

| 원인 | 해결 |
|---|---|
| Relay Server가 실행되지 않음 | VS Code에서 Cline MCP 서버가 활성화되어 있는지 확인. Cline이 서버를 자동 기동합니다 |
| 포트 불일치 | 플러그인 UI의 포트 번호와 `WS_PORT` 환경변수가 일치하는지 확인 (기본: `8080`) |
| 포트가 이미 사용 중 | `lsof -i :8080` (Mac) 또는 `netstat -ano \| findstr :8080` (Windows)로 확인 후 해당 프로세스 종료 |
| Figma 웹 버전 사용 중 | **Figma Desktop 앱**을 사용해야 합니다 |

### Cline에서 MCP 서버가 안 보여요

| 원인 | 해결 |
|---|---|
| 설정 파일 경로 오류 | `args`의 `index.js` 절대 경로가 정확한지 확인 |
| 빌드를 안 했음 | `cd relay-server && npm install && npm run build` 실행 |
| VS Code 미재시작 | 설정 변경 후 VS Code를 재시작하세요 |
| JSON 문법 오류 | 설정 파일의 JSON이 유효한지 확인 (trailing comma 등) |

### Timeout 에러가 나요

| 원인 | 해결 |
|---|---|
| 플러그인이 연결되지 않음 | Figma에서 플러그인이 실행 중이고 🟢 상태인지 확인 |
| Figma가 백그라운드에 있음 | Figma Desktop을 포그라운드로 가져오세요 |
| 복잡한 코드 실행 | `CODE_TIMEOUT_MS` 환경변수를 늘려주세요 (기본: 30초) |

### 플러그인 코드를 수정한 후 반영이 안 돼요

```bash
cd figma-plugin
npm run build
```

빌드 후 **Figma에서 플러그인을 닫고 다시 실행**해야 새 코드가 로드됩니다.

### 폰트 관련 에러 (`Cannot write to node with unloaded font`)

텍스트 노드를 수정하려면 해당 폰트가 로드되어야 합니다. `run_figma_code`를 사용할 때는 반드시 `figma.loadFontAsync()`를 먼저 호출하세요:

```javascript
await figma.loadFontAsync({family: 'Inter', style: 'Regular'});
const text = figma.createText();
text.characters = '안녕하세요';
return text.id
```

---

## 환경 변수

MCP 서버 설정의 `env` 항목으로 전달합니다:

```json
{
  "env": {
    "WS_PORT": "8080",
    "REQUEST_TIMEOUT_MS": "10000",
    "CODE_TIMEOUT_MS": "30000"
  }
}
```

| 변수 | 기본값 | 설명 |
|---|---|---|
| `WS_PORT` | `8080` | WebSocket 서버 포트. 플러그인 UI의 포트와 일치해야 함 |
| `REQUEST_TIMEOUT_MS` | `10000` | 일반 요청(read/write) Figma 응답 타임아웃 (ms) |
| `CODE_TIMEOUT_MS` | `30000` | `run_figma_code` 전용 타임아웃 (ms) |

---

## 프로젝트 구조

```
figma-mcp-bridge/
├── relay-server/              # Node.js Relay (MCP + WebSocket)
│   ├── src/
│   │   └── index.ts           # MCP 서버 + WebSocket 서버 메인 코드
│   ├── dist/                  # 빌드 결과물 (npm run build 후 생성)
│   │   └── index.js           # ← MCP 설정에서 이 파일을 가리킴
│   ├── tsconfig.json
│   └── package.json
│
├── figma-plugin/              # Figma Plugin
│   ├── manifest.json          # Figma Plugin 매니페스트 (Figma에서 import)
│   ├── code.ts                # Plugin main (Figma API 핸들러)
│   ├── code.js                # 빌드 결과물 (Figma가 로드하는 파일)
│   ├── ui.html                # Plugin UI (WebSocket 클라이언트, 연결 관리)
│   ├── tsconfig.json
│   └── package.json
│
├── .gitignore
└── README.md
```

### 동작 원리

1. **Cline(VS Code)** 이 MCP 프로토콜(stdio)로 Relay Server에 요청 전송
2. **Relay Server** 가 WebSocket으로 Figma Plugin에 요청 전달
3. **Figma Plugin** (code.ts)이 Figma Plugin API를 호출하여 작업 수행
4. 결과를 **역순**으로 전달: Plugin → Relay → Cline

---

## 메시지 프로토콜 (개발자용)

### 요청/응답 매핑

| Request Type | Response Type | 설명 |
|---|---|---|
| `GET_SELECTION` | `SELECTION_RESULT` | 선택된 레이어 데이터 |
| `GET_STYLES` | `STYLES_RESULT` | 로컬 스타일 목록 |
| `GET_COMPONENTS` | `COMPONENTS_RESULT` | 컴포넌트 목록 |
| `GET_NODE_BY_ID` | `NODE_RESULT` | 특정 노드 상세 정보 |
| `CREATE_NODE` | `CREATE_RESULT` | 노드 생성 |
| `MODIFY_NODE` | `MODIFY_RESULT` | 노드 수정 |
| `DELETE_NODES` | `DELETE_RESULT` | 노드 삭제 |
| `EXPORT_NODE` | `EXPORT_RESULT` | 이미지 내보내기 |
| `RUN_CODE` | `CODE_RESULT` | 임의 코드 실행 |

### 메시지 형식

```json
// Request (Relay → Figma Plugin)
{
  "messageId": "uuid-v4",
  "type": "GET_SELECTION",
  "payload": {}
}

// Response (Figma Plugin → Relay)
{
  "messageId": "uuid-v4",
  "type": "SELECTION_RESULT",
  "payload": { "error": null, "layers": [...] }
}
```

---

## 라이선스

ISC
