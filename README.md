# Figma ↔ AI Bridge (MCP + HTTP)

로컬 WebSocket 기반의 Figma–AI 브릿지 서버입니다.  
**MCP 모드**(Cursor, Cline 등)와 **HTTP 모드**(MCP 차단 환경)를 모두 지원하며,  
AI Extension이 Figma 디자인 데이터를 **읽고 쓸 수** 있게 합니다.

```
Mode A: MCP
┌──────────────┐    stdio     ┌───────────────┐   WebSocket    ┌──────────────┐
│  Cursor /    │ ◀──────────▶ │  Relay Server │ ◀────────────▶ │  Figma       │
│  Cline (AI)  │   MCP 프로토콜 │  (Node.js)    │   ws://8080    │  (Plugin)    │
└──────────────┘              └───────────────┘                └──────────────┘

Mode B: HTTP + CLI (MCP 차단 환경)
┌──────────────┐   shell cmd  ┌───────────────┐   HTTP     ┌───────────────┐   WebSocket   ┌──────────────┐
│  Cline (AI)  │ ──────────▶ │  figma-cli.js │ ────────▶ │  HTTP Server  │ ◀───────────▶ │  Figma       │
│              │   stdout     │  (CLI 래퍼)    │  :3000     │  (Express)    │   ws://8080   │  (Plugin)    │
└──────────────┘              └───────────────┘            └───────────────┘               └──────────────┘
```

---

## 목차

- [사전 요구사항](#사전-요구사항)
- [설치 가이드](#설치-가이드)
- [Mode A: MCP 모드](#mode-a-mcp-모드-cursor--cline)
- [Mode B: HTTP + CLI 모드](#mode-b-http--cli-모드-mcp-차단-환경)
- [CLI 사용법](#cli-사용법)
- [Compact 응답 모드](#compact-응답-모드)
- [Design System](#design-system)
- [Cline 하네스 설정](#cline-하네스-설정-clinerules)
- [약한 모델 환경에서의 AI 하네스](#약한-모델-환경에서의-ai-하네스)
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
| **VS Code** | 최신 | Cline 또는 Cursor |

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

## Mode A: MCP 모드 (Cursor / Cline)

MCP가 사용 가능한 환경에서 사용합니다.

### Cursor 설정

`~/.cursor/mcp.json` 또는 프로젝트의 `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "figma-bridge": {
      "command": "node",
      "args": ["/절대경로/figma-mcp-bridge/relay-server/dist/index.js"],
      "env": { "WS_PORT": "8080" }
    }
  }
}
```

### Cline 설정

Cline MCP 설정 파일 (`cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "figma-bridge": {
      "command": "node",
      "args": ["/절대경로/figma-mcp-bridge/relay-server/dist/index.js"],
      "env": { "WS_PORT": "8080" }
    }
  }
}
```

### 사용법

자연어로 AI에게 요청하면 됩니다:

```
"Figma에서 현재 선택된 레이어 정보 가져와"
"320x200 파란색 카드 프레임 만들어줘"
"Auto Layout 카드 컴포넌트 만들어줘"
```

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

### Cline에서 사용

Cline이 `figma-cli.js`를 통해 Figma를 제어합니다.  
프로젝트 루트에 `.clinerules` 파일이 포함되어 있어, Cline이 자동으로 CLI 사용법을 인식합니다.

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

## Cline 하네스 설정 (.clinerules)

`.clinerules` 파일이 프로젝트 루트에 포함되어 있습니다.  
이 파일은 Cline에게 다음을 안내합니다:

1. **CLI 사용법**: 각 명령의 문법과 예시
2. **워크플로우**: 파일 실행 > 플래그 명령 > eval 순서 권장
3. **디자인 규칙**: DESIGN.md 참조 의무
4. **코드 패턴**: Auto Layout, 텍스트, 노드 조회 등 빈출 패턴
5. **컨텍스트 관리**: depth 제한, 단계별 조회, 섹션별 작업 가이드

---

## 약한 모델 환경에서의 AI 하네스

최신·고성능 모델은 짧은 지시와 느슨한 문서만으로도 잘 동작하는 경우가 많습니다. 반면 **회사에서 쓰는 모델이 상대적으로 약할수록** 암묵 지식·맥락 추론·에러 복구가 부족해지므로, “좋은 모델이면 알아서 할 거야”에 기대기 어렵습니다. 그 차이를 **하네스(규칙 + 스킬 + 형식 + 검증)**로 보완하는 것이 실무적으로 맞습니다.

### 1. 먼저 진단할 것 (실패 패턴)

| 관찰 | 하네스에서 보완할 방향 |
|------|------------------------|
| 지시를 반만 따름 | 작업을 단계로 쪼개고, 각 단계에 **완료 조건** 명시 |
| 파일·경로·이름 틀림 | 금지 목록·허용 패턴·「수정 전 grep으로 확인」 같은 **고정 절차** |
| 이전 맥락 누락 | 티켓 ID, 브랜치, 현재 목표 등 **매 턴 붙는 단일 진실** (`memory-bank/activeContext.md` 등) |
| 환각 (API·버전) | 공식 문서 링크·레포 내 실제 코드만 신뢰하라고 **규칙에 명시** |
| 한 번에 너무 많이 함 | “한 PR·한 커밋 = 한 목적” + **템플릿으로 범위 제한** |
| 테스트·빌드 안 돌림 | CI 스크립트 이름을 규칙에 박고 **변경 후 반드시 실행할 명령** 지정 |

**약한 모델일수록** “어떤 질문·작업에서 자주 틀리는지”를 로그로 남기는 것이 하네스 설계의 1순위 재료가 됩니다.

### 2. 하네스를 촘촘히 하는 축

1. **경계(Boundary)** — 삭제 금지 경로, 시크릿, 프로덕션 DB 등 금지 영역과, 사람 승인이 필요한 변경(마이그레이션·권한)을 명문화합니다.
2. **절차(Procedure)** — 읽기 → 계획 → 최소 수정 → 검증 같은 **고정 순서**를 문서·룰에 넣습니다. 약한 모델은 **체크리스트가 있으면** 따르기 쉽습니다.
3. **형식(Schema)** — PR 설명, 이슈 답변, 완료 정의를 **항목 리스트**로 강제합니다. 도구 호출이 있으면 인자를 짧고 명확하게(선택지 줄이기) 유지합니다.
4. **예시(Few-shot)** — “좋은 답·나쁜 답” 한 쌍, **회사 코드 스타일**에 맞은 짧은 예시만 넣어도 품질이 자주 오릅니다.
5. **검증(Verification)** — 린트·타입체크·스모크 테스트 등, **실패 시 중단·보고**까지 규칙에 포함합니다.
6. **컨텍스트 예산** — 긴 `DESIGN.md` 전체 대신 **해당 작업에 필요한 섹션만** 인용하거나 요약본을 유지합니다. 약한 모델은 **긴 컨텍스트에서 중요한 것을 놓치기** 쉽습니다.

### 3. “추론이 드러난다”와 약한 모델

UI에 계획·체인이 보여도, 내부 추론은 짧을 수 있습니다. 그래서 **외부에 보이는 계획·체크리스트**를 도구나 템플릿으로 강제하는 편이 안전합니다 (예: 계획 3줄 → 승인 → 코드).

### 4. 회사에서 구체적으로 볼 것 (체크리스트)

- **에러 로그**: 같은 실수가 반복되는지(import 경로, 환경 변수 이름 등)
- **PR 리뷰 코멘트**: 모델이 자주 지적받는 유형
- **CI 실패 유형**: flaky인지, 진짜 로직 버그인지
- **도메인 용어**: 사내 용어집이 있으면 룰·스킬에 한 페이지로 요약
- **금지·필수 도구**: 예) DB는 항상 스테이징 URL만

**한 줄 요약:** 약한 모델용 하네스는 **암묵을 금지**하고, **단계·형식·검증·예시**를 박아 넣는 것입니다. 회사에서는 **실패 로그와 리뷰 코멘트**를 모아 “자주 틀리는 다섯 가지”부터 규칙으로 옮기는 것이 ROI가 큽니다.

---

## 제공되는 MCP Tools

> MCP 모드에서만 사용 가능합니다. HTTP 모드에서는 동일한 기능이 REST API + CLI로 제공됩니다.

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
| 서버가 실행되지 않음 | MCP: Cline이 자동 기동. HTTP: `npm run start:http` 실행 |
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
| 복잡한 코드 | `CODE_TIMEOUT_MS` 환경변수 증가 |

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
| `REQUEST_TIMEOUT_MS` | `10000` | 일반 요청 타임아웃 (ms) |
| `CODE_TIMEOUT_MS` | `30000` | 코드 실행 타임아웃 (ms) |
| `FIGMA_API` | `http://localhost:3000` | CLI가 연결할 HTTP 서버 주소 |

---

## 프로젝트 구조

```
figma-mcp-bridge/
├── relay-server/              # Node.js Relay Server
│   ├── src/
│   │   ├── ws.ts              # WebSocket 공유 모듈 (MCP/HTTP 공통)
│   │   ├── index.ts           # MCP 모드 엔트리포인트
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
├── figma-cli.js               # CLI 래퍼 (HTTP 모드용, 빌드 불필요)
├── .clinerules                # Cline 하네스 설정
├── DESIGN.md                  # 디자인 토큰 정의 (SSOT)
└── README.md
```

### Scripts

```bash
# MCP 모드 (Cursor / Cline with MCP)
cd relay-server && npm run start:mcp

# HTTP 모드 (Cline without MCP)
cd relay-server && npm run start:http

# Figma 플러그인 빌드
cd figma-plugin && npm run build
```

---

## 라이선스

ISC
