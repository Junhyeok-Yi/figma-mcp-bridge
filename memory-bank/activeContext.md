# Active Context

## 현재 작업 초점

- Phase 3 (읽기 안정화) 완료
- feature/phase1-harness 브랜치에서 작업 중
- main 머지 대기

## 최근 변경

- Phase 3A: 타임아웃 30s/60s로 상향, CLI --timeout 글로벌 플래그, HTTP ?timeout 파라미터
- Phase 3B: compact 3단계(full/smart/skeleton), _defaults 배열, TEXT characters 보호, 500KB auto-truncation
- Phase 3C: GET_CHILDREN_PAGE 핸들러, /api/node/:id/children 엔드포인트, CLI children 명령

## 다음 단계

- feature/phase1-harness → main 머지
- Phase 4 (Figma API 확장) 착수: Pages, Variables, Annotations

## 활성 결정사항

- Mode B(HTTP) 전용으로 고도화 진행
- D2C/C2D는 Phase 4 안정화 후 재평가
