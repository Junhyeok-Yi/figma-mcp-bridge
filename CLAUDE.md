# Figma Bridge — Claude Code Guide

로컬 Figma Desktop을 제어하는 AI 브릿지. Claude Code는 **네이티브 MCP 서버 `figma-bridge`** 를 통해 Figma와 통신한다.

## 연결 전제

1. **Figma Desktop**에서 `MCP Bridge` 플러그인이 실행 중이어야 한다 (Plugins → Development → MCP Bridge). 플러그인 UI에 🟢 연결됨 표시 확인.
2. MCP 서버는 Claude Code가 `.mcp.json`을 통해 자동 spawn하며, 기동 시 **WS 8080**을 점유한다.
3. **WS 8080은 한 번에 하나의 relay만 소유**할 수 있다. HTTP 모드 서버(`npm run start:http`)가 떠 있으면 충돌하므로 먼저 끈다 (`lsof -i :8080`).
4. 연결 확인: `run_figma_code`에 `return figma.currentPage.name` → 페이지명이 반환되면 정상.

## 사용 가능한 MCP 툴 (`mcp__figma-bridge__*`)

| 툴 | 용도 |
|---|---|
| `run_figma_code` | **주력.** 임의 Plugin API 코드 실행. 복잡한 작업은 전부 이걸로 |
| `get_figma_selection` | 현재 선택된 레이어 조회 |
| `get_node_by_id` | ID로 노드 상세 조회 |
| `get_figma_styles` / `get_figma_components` | 로컬 스타일 / 컴포넌트 목록 |
| `create_node` / `modify_node` / `delete_nodes` | 단일 노드 생성·수정·삭제 |
| `export_node` | PNG/SVG/PDF/JPG 내보내기 |

> Pages / Variables / Annotations 전용 툴은 없지만, 전부 `run_figma_code`로 처리한다 (`figma.createPage()`, `figma.variables.*`, `node.annotations` 등).

## 작업 방식

- **복잡한 작업은 `run_figma_code`로.** 코드를 작성하고 `return`으로 결과(특히 생성/수정한 노드 ID)를 반환받는다. 코드는 async 컨텍스트로 자동 래핑되므로 top-level `await`·`return` 사용. `figma.closePlugin()`/IIFE 래핑 금지.
- **단순 읽기는 전용 툴로.** `get_node_by_id`, `get_figma_selection`.
- **결과 확인은 `export_node`(PNG)** 로 시각 검증. base64 PNG를 받아 디코딩해 확인.
- **증분 작업.** 한 번에 너무 많이 하지 말고 단계로 쪼개 검증하며 진행.

## 디자인 규칙

**`DESIGN.md`가 SSOT(Single Source of Truth)다.** 디자인을 만들거나 수정하기 전 반드시 토큰(색상·타이포·간격·라운드·섀도)을 참조한다. HEX는 Figma API에 쓸 때 `{r,g,b}` 0–1 범위로 변환.

## Memory Bank

세션이 리셋되면 이전 작업을 잊는다. `memory-bank/`가 유일한 연결고리다.

- **세션 시작 시**: `memory-bank/`를 읽고 현재 상태 파악. 순서 `projectbrief.md` → `activeContext.md` → `progress.md` → (필요 시 나머지).
- **자동 갱신**: 기능/마일스톤 완료 → `progress.md`+`activeContext.md`. 아키텍처/패턴 변경 → `systemPatterns.md`. 기술 스택 변경 → `techContext.md`.
- **유지 규칙**: 각 파일 1–2페이지, `activeContext.md`는 현재 초점만(과거는 `progress.md`로), 사실만 기록.
- 전체 갱신은 `/update-memory-bank`, 새 프로젝트 시작은 `/reset-memory-bank` 스킬 사용.

## Figma Plugin API 함정 (반드시 숙지)

1. `resize()`는 `primaryAxisSizingMode = "AUTO"` **이전**에 호출. (AUTO + resize → 높이 찌그러짐; HUG를 원하면 resize 호출하지 마라)
2. `layoutSizingHorizontal/Vertical = "FILL"`은 부모에 **`appendChild` 한 뒤** 설정.
3. 텍스트 조작 전 `await figma.loadFontAsync({family, style})`. 스타일명 정확히 — Inter는 **"Semi Bold"**(공백 있음) ≠ "Semibold".
4. **GROUP/Mask 노드는 옮기지 마라** — 마스킹 깨짐. 내용을 새로 만든다.
5. **기존 프레임을 직접 비우지 마라** — staging 프레임에 조립 후 교체. children 삭제는 복구 불가.
6. 노드 조회는 async — `await figma.getNodeByIdAsync(id)`.
7. 색상은 0–1 범위(`{r:1,g:0,b:0}`=red). Paint `color`에 `a` 금지(불투명도는 paint 레벨 `opacity`).
8. 생성/수정한 **노드 ID는 반드시 `return`** — 후속 호출에서 참조.

## 할루시네이션 방지 (핵심만)

- 노드의 `name`은 레이어 이름이지 화면 텍스트가 아니다. 실제 텍스트는 TEXT 노드의 `characters`에만 있다. 보고 시 원문 그대로 인용.
- 읽기 실패/타임아웃은 "읽지 못했습니다"라고 명확히 보고. 추측으로 채우지 마라.

## 스킬

`.claude/skills/`에 도메인 스킬과 워크플로우가 있다:

- **도메인**: `figma-bridge`(MCP 사용법·API 함정), `design-system`(DESIGN.md 적용), `design-quality`(디자인 진단), `a11y-guide`(WCAG), `ux-principles`(Nielsen), `figma-variables`(변수 API)
- **워크플로우**: `/a11y-audit`, `/ux-review`, `/mobile-adapt`, `/register-colors`, `/update-memory-bank`, `/reset-memory-bank`

## 에러 대처

- "Figma plugin not connected" → Figma Desktop에서 플러그인 실행 요청.
- WS 8080 충돌 → HTTP 모드 relay 종료 후 재시도.
- 타임아웃 → 작업을 더 작은 단위로 분할.
