# Update Memory Bank Workflow

Memory Bank 6개 파일을 현재 프로젝트 상태에 맞게 전체 갱신하는 워크플로우.

## Step 1: 현재 Memory Bank 읽기

6개 파일을 전부 읽는다:
```
memory-bank/projectbrief.md
memory-bank/productContext.md
memory-bank/activeContext.md
memory-bank/systemPatterns.md
memory-bank/techContext.md
memory-bank/progress.md
```

## Step 2: 현재 상태 파악

```bash
git status
git log --oneline -10
```
최근 변경사항과 브랜치 상태를 확인한다.

## Step 3: 각 파일 갱신 판단

파일별로 "현재 내용"과 "실제 상태"를 비교하여 갱신 여부를 결정한다:

| 파일 | 갱신 조건 |
|------|----------|
| `projectbrief.md` | 프로젝트 목표/범위가 변경된 경우만 (거의 없음) |
| `productContext.md` | 프로젝트 목적/UX 목표가 변경된 경우 |
| `activeContext.md` | **항상 갱신** — 현재 초점, 최근 변경, 다음 단계 |
| `systemPatterns.md` | 아키텍처/패턴/구조에 변화가 있는 경우 |
| `techContext.md` | 기술 스택/의존성/환경 변수에 변화가 있는 경우 |
| `progress.md` | **항상 갱신** — 완료/미완료/이슈 상태 반영 |

## Step 4: 갱신 실행

변경이 필요한 파일만 수정한다.

규칙:
- 각 파일 **1~2페이지** 이내로 간결하게 유지
- `activeContext.md`는 현재 초점만 남기고, 과거 이력은 `progress.md`의 "완료" 섹션으로 이동
- 사실만 기록. 추측이나 의견을 섞지 않는다.
- 마크다운 형식 유지 (헤딩, 리스트, 코드블록)

## Step 5: 갱신 요약 보고

사용자에게 갱신 결과를 보고한다:
- 갱신된 파일 목록
- 각 파일에서 변경된 핵심 내용 1줄 요약
- 갱신하지 않은 파일과 그 이유
