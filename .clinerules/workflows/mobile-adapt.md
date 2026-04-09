# Mobile Adaptation Workflow

선택된 데스크탑 프레임을 375px 기준 모바일 버전으로 재설계하여 같은 페이지에 생성하는 워크플로우.

## Step 1: 연결 확인
```bash
node figma-cli.js status
```

## Step 2: 원본 프레임 분석
```bash
node figma-cli.js selection --depth 2
```
데스크탑 프레임의 구조, 레이아웃, 콘텐츠를 파악한다:
- 전체 너비와 레이아웃 방향
- 주요 섹션 구분 (header, content, sidebar, footer 등)
- 멀티컬럼 레이아웃 여부
- 텍스트 크기와 간격

## Step 3: 모바일 전환 계획 수립
사용자에게 전환 계획을 제시하고 확인받는다:

일반적인 전환 패턴:
- **2~3컬럼 → 1컬럼**: 수평 배치를 수직 스택으로
- **Sidebar → 접기**: 사이드바를 콘텐츠 아래로 이동
- **Navbar → 햄버거**: 메뉴 항목을 축소
- **테이블 → 카드**: 넓은 테이블을 개별 카드로
- **폰트 축소**: 일반적으로 2px 감소 (최소 14px 본문 유지)
- **패딩 축소**: 데스크탑의 60~70% 수준

## Step 4: DESIGN.md 확인
```bash
cat DESIGN.md
```
DESIGN.md에 모바일 breakpoint, 모바일 전용 토큰이 있으면 참고한다.

## Step 5: 모바일 프레임 생성
원본 프레임 옆에 모바일 버전을 생성한다.

`.js` 파일을 작성하여 실행:
```bash
node figma-cli.js run mobile-adapt-output.js
```

핵심 원칙:
- 너비: **375px** (iPhone SE 기준)
- 최소 터치 타겟: **44x44px**
- 본문 폰트: **최소 14px**
- 좌우 패딩: **16px**
- 섹션 간격: **16~24px**
- auto-layout 사용 필수

## Step 6: 검증
생성된 모바일 프레임을 읽어서 확인:
```bash
node figma-cli.js node <mobile_frame_id> --depth 1
```

확인 사항:
- 375px 너비에 맞게 배치되었는가
- 텍스트가 잘리지 않는가
- 터치 타겟이 44px 이상인가
- 콘텐츠 순서가 논리적인가

## Step 7: 결과 보고
- 원본 프레임 ID와 모바일 프레임 ID
- 적용된 전환 패턴 목록
- 수동으로 추가 조정이 필요한 부분 안내
