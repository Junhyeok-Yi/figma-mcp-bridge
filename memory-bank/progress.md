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
- [x] Phase 3: 읽기 안정화 — 타임아웃 30s/60s, compact 3단계, _defaults, TEXT 보호, auto-truncation, children 페이지네이션
- [x] Phase 4: Figma API 확장 — Pages/Variables/Annotations opcode + CLI 명령 + 헬퍼 스크립트 4개

- [x] 코드리뷰 12건 수정 — compact 기본값 통일, parseFlags boolean, readTimeout 제거, main.md 갱신 등
- [x] Phase 5: DESIGN.md 표준화 — design-system.md → DESIGN.md 리네임, 전체 참조 통일

- [x] Phase 6: 벤치마크 검증 — 프레임 5종×3모드 벤치마크 + MB 세션 복원 테스트 (32/32 pass)

## 진행 중

- [ ] feature/phase1-harness → main 머지

## 미완료

## 알려진 이슈

- 대형 프레임(자식 50+): auto-truncation(500KB, 20개)으로 대응, 그 이상은 `children --offset` 필요
- component instance 내부가 과도하게 전개됨 → `--depth` 제한 권장
- ~~design-system.md/DESIGN.md 네이밍 불일치~~ → Phase 5에서 DESIGN.md로 통합 완료
- Annotations API: Figma Plugin API 신규 네임스페이스, 버전 호환성 검증 필요
