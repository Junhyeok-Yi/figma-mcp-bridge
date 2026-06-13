---
name: figma-bridge
description: "Figma Bridge MCP 툴로 피그마 읽기/쓰기 작업 시 사용. 노드 조회, 디자인 생성·수정, 코드 실행, 이미지 내보내기 시 활성화. run_figma_code 사용 패턴과 Figma Plugin API 함정을 다룬다."
---

# Figma Bridge (MCP)

Claude Code는 네이티브 MCP 서버 `figma-bridge`로 Figma Desktop과 통신한다. 모든 툴은 `mcp__figma-bridge__*` 형태로 호출한다 (Claude Code에서는 deferred 툴 — ToolSearch로 스키마 로드 후 사용).

## 연결 확인

```
mcp__figma-bridge__run_figma_code  { code: "return figma.currentPage.name" }
```
페이지명이 반환되면 정상. 실패 시 Figma Desktop에서 `MCP Bridge` 플러그인이 실행 중인지(🟢 연결됨) 확인.

## 읽기

```
mcp__figma-bridge__get_figma_selection      // 현재 선택된 레이어
mcp__figma-bridge__get_node_by_id  { nodeId: "9:2" }
mcp__figma-bridge__get_figma_styles
mcp__figma-bridge__get_figma_components
```
복잡한 조회는 `run_figma_code`로 직접:
```js
// 페이지 내 모든 TEXT 내용
const t = figma.currentPage.findAll(n => n.type === 'TEXT');
return t.map(n => ({ id: n.id, name: n.name, characters: n.characters }));
```

## 쓰기 — `run_figma_code`가 주력

복잡한 생성/수정은 단일 노드 툴(`create_node`/`modify_node`)보다 `run_figma_code`로 한 번에 처리하는 게 안정적이다.

```js
// 카드 프레임 + 텍스트
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
const card = figma.createFrame();
card.name = "Card"; card.resize(320, 200); card.cornerRadius = 16;
card.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
const t = figma.createText();
t.fontName = { family: "Inter", style: "Semi Bold" };
t.characters = "제목"; t.fontSize = 20;
card.appendChild(t);
return { cardId: card.id, textId: t.id };   // 생성한 노드 ID는 반드시 return
```

코드 규칙:
- async 컨텍스트로 자동 래핑 — top-level `await`/`return` 사용. IIFE·`figma.closePlugin()` 금지.
- `console.log`는 반환 안 됨 → `return`으로 결과 출력.
- 생성/수정한 **노드 ID를 전부 return** (후속 호출에서 참조).

단일 노드 빠른 작업은 전용 툴도 가능:
```
mcp__figma-bridge__create_node  { nodeType: "FRAME", properties: { name:"Box", width:200, height:120, cornerRadius:12 } }
mcp__figma-bridge__modify_node  { nodeId: "9:2", properties: { cornerRadius: 8 } }
mcp__figma-bridge__delete_nodes { nodeIds: ["9:2"] }
```

## 내보내기 (시각 검증)

```
mcp__figma-bridge__export_node  { nodeId: "9:2", format: "PNG", scale: 2 }
```
PNG/JPG는 base64로 반환 → 디코딩해 확인. 작업 후 결과를 눈으로 검증할 때 사용.

## 페이지 / 변수 / 주석 (전용 툴 없음 → run_figma_code)

```js
// 페이지 전환 (sync setter 금지, async만)
const p = figma.root.children.find(p => p.name === "My Page");
await figma.setCurrentPageAsync(p);

// 변수 조회
const vars = await figma.variables.getLocalVariablesAsync();
return vars.map(v => ({ id: v.id, name: v.name, type: v.resolvedType }));
```

## ⚠️ Figma Plugin API 함정 (반드시 숙지)

### GROUP/Mask 노드는 절대 옮기지 마라
Mask Group을 다른 프레임에 `appendChild`하면 마스킹 컨텍스트가 깨진다. auto-layout으로 재구성하려면 **내용을 새로 만들어야 한다.**

### `layoutSizingHorizontal/Vertical = "FILL"`은 부모에 붙인 뒤에만
```js
// ❌ 틀림 — 부모에 붙이기 전
child.layoutSizingHorizontal = "FILL";
parent.appendChild(child);
// ✅ 맞음
parent.appendChild(child);
child.layoutSizingHorizontal = "FILL";
```

### 파괴적 작업은 staging 프레임에서 먼저 조립
기존 프레임의 children을 삭제하면 복구 불가. 새 프레임을 옆에 만들어 조립 → 확인 후 교체.

### Auto-Layout 전환 주의
- `layoutMode` 변경 시 기존 자식의 absolute 좌표가 무시된다.
- `primaryAxisSizingMode="AUTO"` + `resize(w, 작은값)` → 높이 찌그러짐. HUG를 원하면 resize를 호출하지 마라. (resize는 sizing mode 설정 **이전**에)

### 폰트 스타일 이름 정확히
Inter의 "Semibold"는 Figma에서 **"Semi Bold"**(공백). 텍스트 조작 전 `await figma.loadFontAsync()`로 사전 로드. 불확실하면 `await figma.listAvailableFontsAsync()`로 확인.

### 색상은 0–1 범위
`{r:1,g:0,b:0}` = red. Paint `color`에 `a` 넣지 마라(불투명도는 paint 레벨 `opacity`).

### 노드 조회는 async
`await figma.getNodeByIdAsync(id)` 사용.

## 템플릿·스크립트 라이브러리

`templates/`와 `scripts/`에 재사용 가능한 Plugin API 코드가 있다. MCP에서는 해당 `.js` 파일을 읽어 `run_figma_code`의 `code`로 전달해 실행한다.

```
templates/card.js, button.js, input.js, navbar.js, bento-grid.js, cta-premium.js ...
scripts/login-page.js, dashboard.js, color-palette.js ...
```

## 타임아웃 대처

| 상황 | 해결책 |
|------|--------|
| 읽기 타임아웃 | 조회 범위 축소(특정 노드 ID로 분할) |
| 쓰기 타임아웃 | 작업을 여러 `run_figma_code` 호출로 분할 |
| 대형 프레임 | 구조부터 파악 후 필요한 자식만 drill-down |
