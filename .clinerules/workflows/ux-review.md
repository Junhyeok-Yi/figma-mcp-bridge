# UX Review Workflow

선택된 Figma 프레임에 대해 UX 관점의 피드백을 생성하고 annotation으로 달아주는 워크플로우.

## Step 1: 연결 확인
```bash
node figma-cli.js status
```
연결되어 있지 않으면 사용자에게 Figma 플러그인 실행을 요청하고 중단.

## Step 2: 프레임 구조 파악
```bash
node figma-cli.js selection --skeleton
```
선택된 프레임의 전체 구조(노드 타입, 자식 수)를 파악한다.
프레임이 선택되지 않았으면 사용자에게 프레임 선택을 요청하고 중단.

## Step 3: 섹션별 상세 읽기
구조에서 파악된 주요 섹션(Header, Content, Footer 등)을 각각 `--depth 2`로 읽는다:
```bash
node figma-cli.js node <section_id> --depth 2
```
각 섹션의 레이아웃, 색상, 타이포그래피, 간격을 정확히 파악한다.
TEXT 노드의 `characters`는 반드시 원문 그대로 기록한다.

## Step 4: Nielsen 10 Heuristics 대조
`ux-principles` 스킬을 참조하여 다음 10가지 기준으로 평가한다:

1. Visibility of system status
2. Match between system and real world
3. User control and freedom
4. Consistency and standards
5. Error prevention
6. Recognition rather than recall
7. Flexibility and efficiency of use
8. Aesthetic and minimalist design
9. Help users recognize, diagnose, recover from errors
10. Help and documentation

## Step 5: 피드백 구조화
각 발견사항을 다음 형식으로 정리한다:

```
[심각도] 카테고리 — 문제 설명
- 위치: 노드 이름 또는 영역
- 현재: 현재 상태 설명
- 제안: 개선 방안
```

심각도:
- **Critical**: 사용자가 작업을 완료하지 못하는 문제
- **Major**: 사용성을 크게 저하시키는 문제
- **Minor**: 개선하면 좋은 사항

## Step 6: Annotation 달기
각 피드백을 해당 노드에 annotation으로 추가한다:
```bash
node figma-cli.js eval 'const n = await figma.getNodeByIdAsync("NODE_ID"); n.annotations = [...(n.annotations||[]), {label: "UX: [심각도] 피드백 내용"}]; return "done";'
```

## Step 7: 요약 보고
전체 피드백을 심각도별로 분류하여 사용자에게 보고한다:
- Critical 건수
- Major 건수
- Minor 건수
- 가장 우선 개선이 필요한 항목 Top 3
