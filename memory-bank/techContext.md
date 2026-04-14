# Tech Context

## 기술 스택

- Runtime: Node.js 18+
- Language: TypeScript (relay-server, figma-plugin), JavaScript (CLI, templates, scripts)
- Server: Express (HTTP), WebSocket (ws 라이브러리)
- MCP: @modelcontextprotocol/sdk (비활성)
- Plugin: Figma Plugin API (code.ts + ui.html)

## 프로젝트 구조

```
relay-server/src/
  ws.ts              — WebSocket 공유 모듈 (MCP/HTTP 공통)
  index.ts           — MCP 엔트리포인트 (비활성)
  http-server.ts     — Express HTTP 엔트리포인트
figma-plugin/
  code.ts            — Plugin main (extractNodeData, compactify)
  ui.html            — Plugin UI (WebSocket 클라이언트)
  manifest.json      — Plugin 매니페스트
figma-cli.js         — CLI 래퍼 (project root)
templates/           — UI 템플릿 6개 (card, button, input, list, navbar, table)
scripts/             — 예제 스크립트 (login-page, dashboard, color-palette)
memory-bank/         — 세션 간 컨텍스트 유지 (6개 핵심 파일)
.clinerules/         — Rules 3개 + Workflows 5개
.cline/skills/       — Skills 5개
```

## 주요 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| WS_PORT | 8080 | WebSocket 포트 |
| HTTP_PORT | 3000 | HTTP API 포트 |
| REQUEST_TIMEOUT_MS | 30000 | 일반 요청 타임아웃 (Phase 3에서 10s→30s) |
| CODE_TIMEOUT_MS | 60000 | 코드 실행 타임아웃 (Phase 3에서 30s→60s) |
| FIGMA_API | http://localhost:3000 | CLI 연결 주소 |

## 읽기 3단계 (Phase 3)

| Level | CLI 플래그 | 용도 |
|-------|-----------|------|
| full | --verbose | 모든 속성 + CSS |
| smart (기본) | (없음) | compact + _defaults 배열 + auto-truncation(500KB) |
| skeleton | --skeleton | id/name/type/childCount만 (TEXT는 characters 포함) |

## 제약사항

- 회사 환경: MCP 차단, Mode B만 사용 가능
- 모델 제약: 60K 컨텍스트, 약한 추론 → 하네스로 보상
- Figma Desktop 필수 (웹 버전 WebSocket 제한)
- 폰트 로드 필수: `figma.loadFontAsync()` before text manipulation
