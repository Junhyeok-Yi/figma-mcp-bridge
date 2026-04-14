# System Patterns

## 아키텍처

```
Mode B (HTTP + CLI) — 현재 사용:
  Cline → figma-cli.js → HTTP Server(:3000) → WebSocket(:8080) → Figma Plugin

Mode A (MCP, 비활성):
  Cursor → MCP stdio → Relay Server → WebSocket(:8080) → Figma Plugin
```

## 핵심 패턴

- **WebSocket 공유**: ws.ts가 MCP/HTTP 양쪽에서 공통 사용
- **Compact 응답**: RGB→HEX, 기본값 생략, _defaults 배열, depth 제한 → 토큰 63% 절감
- **파일 기반 실행**: `run <file.js>`로 JSON 이스케이프 문제 회피
- **배치 참조**: `$ref.nodeId`로 이전 작업 결과를 다음 작업에서 사용
- **템플릿 API**: `tpl card --title "..."` 한 줄로 컴포넌트 생성

## 하네스 3계층

```
⓪ Rules (.clinerules/)      — 시스템 프롬프트 자동 주입, 글로벌 제약
① Memory Bank (memory-bank/) — AI의 첫 명시적 액션, 프로젝트 상태 파악
② Workflows (.clinerules/workflows/) — / 명령 트리거, 멀티스텝 자동화
③ Skills (.cline/skills/)    — 온디맨드 자동 감지, 전문 지식
```

- Rules = "헌법" — 항상 지키는 제약 (~3-5K tokens/req)
- Memory Bank = "기억" — 세션 간 프로젝트 컨텍스트 유지
- Workflows = "레시피" — 특정 작업의 단계별 절차
- Skills = "전문서적" — 필요 시 자동 로드되는 심층 지식
