# Product Context

## 이 프로젝트가 존재하는 이유

회사에서 MCP가 차단되어 Cline이 Figma를 직접 제어할 수 없다.
HTTP API + CLI 래퍼로 우회하되, JSON 이스케이프 문제를 해결하고
AI가 생성하는 디자인 품질을 하네스 엔지니어링으로 끌어올린다.

## 해결하는 문제

1. MCP 차단 환경에서 AI↔Figma 통신
2. curl의 JSON 이스케이프 문제 → `figma-cli.js`로 해결
3. AI가 생성하는 디자인의 낮은 품질 → 하네스(Rules/Workflows/Skills)로 해결
4. 세션 간 컨텍스트 유실 → Memory Bank로 해결

## UX 목표

- 자연어 한 줄로 Figma 디자인 작업 가능
- 워크플로우 명령 하나로 접근성 감사, UX 리뷰 자동화
- 디자인 시스템 토큰이 자동 적용되는 일관된 산출물
