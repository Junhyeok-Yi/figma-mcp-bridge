# Figma MCP Bridge

Figma Desktop과 AI 에이전트(Cline/Cursor)를 연결하는 로컬 브릿지.
MCP 모드와 HTTP+CLI 모드를 모두 지원하여, MCP 차단 환경에서도
AI가 Figma 디자인 데이터를 읽고 쓸 수 있게 한다.

## 핵심 목표

1. AI가 Figma를 정확히 읽고 쓸 수 있는 안정적 파이프라인
2. 약한 모델(60K 컨텍스트)에서도 할루시네이션 없이 동작
3. 하네스(Rules/Workflows/Skills)로 AI 행동 품질 보장
4. 디자인 시스템 토큰 기반의 일관된 산출물

## 사용 환경

- 회사: MCP 차단 → Mode B (HTTP + CLI) 전용
- 개인: Mode A (MCP) 사용 가능하나 현재 비활성
