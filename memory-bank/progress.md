# Progress

## 완료

- [x] 초기 구현: MCP + WebSocket 기반 읽기/쓰기
- [x] HTTP 모드 + CLI 래퍼 (`figma-cli.js`)
- [x] 응답 경량화: compact 모드, 토큰 63% 절감
- [x] 템플릿 API: card, button, input, list, navbar, table
- [x] 예제 스크립트: login-page, dashboard, color-palette
- [x] 배치 참조: `$ref` 변수 치환
- [x] Phase 1: 하네스 체계화 — Rules 3개 + Workflows 4개 + Skills 5개
- [x] Phase 2: Memory Bank 도입 — 6개 핵심 파일 + 규칙 + 워크플로우

## 진행 중

- [ ] feature/phase1-harness → main 머지

## 미완료

- [ ] Phase 3: 읽기 안정화 (타임아웃 30s/60s, compact 3단계, auto-truncation, children 페이지네이션)
- [ ] Phase 4: Figma API 확장 (Pages, Variables, Annotations CLI 명령 + 헬퍼 스크립트)
- [ ] Phase 5: DESIGN.md 표준화 (design-system.md → DESIGN.md 통합)
- [ ] Phase 6: 벤치마크 검증 (프레임 5개 + MB 세션 복원 테스트)

## 알려진 이슈

- 대형 프레임(자식 50+) 읽기 시 타임아웃 가능 (REQUEST_TIMEOUT_MS=10s)
- compact 모드에서 정보 손실 → 할루시네이션 유발 가능
- component instance 내부가 과도하게 전개됨
- design-system.md와 DESIGN.md 네이밍 불일치 (Phase 5에서 통합 예정)
