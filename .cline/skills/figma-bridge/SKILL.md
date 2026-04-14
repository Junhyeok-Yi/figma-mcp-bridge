---
name: figma-bridge
description: "Figma Bridge CLI로 피그마 읽기/쓰기 작업 시 사용. 프레임 선택, 노드 조회, 디자인 생성, 템플릿 사용, 배치 작업 시 활성화."
---

# Figma Bridge CLI

Figma와 통신하는 CLI 도구 사용 가이드.

## 기본 사용법

```bash
# 연결 상태 확인
node figma-cli.js status

# 선택된 노드 읽기
node figma-cli.js selection
node figma-cli.js selection --skeleton    # 구조만
node figma-cli.js selection --depth 2     # 2단계까지

# 특정 노드 읽기
node figma-cli.js node <id>
node figma-cli.js node <id> --verbose     # 전체 데이터
node figma-cli.js node <id> --skeleton    # 구조만
node figma-cli.js node <id> --depth 1     # 1단계만

# 스타일/컴포넌트 목록
node figma-cli.js styles
node figma-cli.js components
```

## 쓰기 명령

```bash
# 노드 생성
node figma-cli.js create FRAME --name "Card" --w 320 --h 200 --fill "#FFFFFF"
node figma-cli.js create TEXT --text "Hello" --font "Inter/Bold" --parent <id>

# 노드 수정
node figma-cli.js modify <id> --fill "#FF0000" --radius 12

# 노드 삭제
node figma-cli.js delete <id1> <id2>

# 이미지 추출
node figma-cli.js export <id> --format svg
node figma-cli.js export <id> --format png --scale 2
```

## 코드 실행

복잡한 작업은 항상 `.js` 파일을 작성해서 실행:

```bash
# 파일 실행 (권장)
node figma-cli.js run my-script.js

# 인라인 코드 (간단한 작업만)
node figma-cli.js eval 'return figma.currentPage.name;'
```

`.js` 파일 내에서:
- `figma` 글로벌 객체 사용 가능
- `async/await` 사용 가능
- `return` 으로 결과 반환
- 반드시 `await figma.loadFontAsync(...)` 후 텍스트 조작

## 템플릿

UI 패턴을 한 명령으로 생성:

```bash
node figma-cli.js tpl card --title "제목" --desc "설명" --button "확인"
node figma-cli.js tpl button --text "제출" --variant primary --size lg
node figma-cli.js tpl input --label "이메일" --placeholder "name@co.com"
node figma-cli.js tpl list --items "항목1,항목2,항목3"
node figma-cli.js tpl navbar --title "앱" --items "홈,설정,프로필"
node figma-cli.js tpl table --cols "이름,이메일" --rows "홍길동,hong@test.com;김철수,kim@test.com"
```

공통 플래그: `--parent <nodeId>`, `--x <num>`, `--y <num>`

## 배치 작업

여러 작업을 순서대로 실행 + 결과 참조:

```json
[
  {"type": "CREATE_NODE", "payload": {"nodeType": "FRAME", "properties": {"name": "Card"}}, "ref": "card"},
  {"type": "RUN_CODE", "payload": {"code": "const n = await figma.getNodeByIdAsync('$card.nodeId'); return n.name;"}}
]
```

`$ref.property` — 이전 결과의 속성을 참조.

## ⚠️ Figma API 함정 (반드시 숙지)

### GROUP/Mask 노드는 절대 옮기지 마라
Mask Group을 다른 프레임에 `appendChild`하면 마스킹 컨텍스트가 깨진다.
기존 GROUP을 auto-layout으로 재구성하려면 **내용을 새로 만들어야 한다.**

### layoutSizingHorizontal/Vertical = "FILL"은 부모에 붙인 뒤에만 호출
```js
// ❌ 틀림 — 부모에 붙이기 전
child.layoutSizingHorizontal = "FILL";
parent.appendChild(child);

// ✅ 맞음 — 부모에 붙인 후
parent.appendChild(child);
child.layoutSizingHorizontal = "FILL";
```

### 파괴적 작업은 별도 프레임에서 먼저 조립
기존 프레임의 children을 삭제하면 복구 불가. 반드시:
1. 새 프레임을 **옆에** 생성하여 조립
2. 결과 확인 후 기존 프레임 교체 or 삭제

```js
// ✅ 안전한 패턴
const staging = figma.createFrame();
staging.name = "Staging";
// ... staging에 전부 조립 ...
// 확인 후 기존 프레임 교체
```

### Auto-Layout 전환 시 주의
- `layoutMode` 변경 시 기존 자식의 absolute 좌표가 무시됨
- 전환 전 자식 순서와 크기를 미리 파악하고, 전환 후 재조정
- `primaryAxisSizingMode = "AUTO"` + `resize(w, 작은값)` → 높이가 찌그러짐. HUG를 원하면 resize를 호출하지 마라

### 폰트 스타일 이름 확인 필수
Inter의 "Semibold"는 Figma에서 "Semi Bold" (공백 있음).
반드시 `figma.loadFontAsync()`로 사전 검증:
```js
try {
  await figma.loadFontAsync({family:"Inter", style:"Semi Bold"});
} catch { /* fallback */ }
```

## 타임아웃 대처

| 상황 | 해결책 |
|------|--------|
| 읽기 타임아웃 | `--depth` 낮추기 또는 `--skeleton` 사용 |
| 쓰기 타임아웃 | 작업을 여러 `.js` 파일로 분할 |
| 대형 프레임 | `--skeleton` → drill-down 패턴 |
| 많은 자식 | 개별 노드 ID로 분할 조회 |

## 스크립트 라이브러리

`scripts/` 폴더에 미리 만들어진 스크립트:

```bash
node figma-cli.js run scripts/login-page.js      # 로그인 페이지
node figma-cli.js run scripts/dashboard.js        # 대시보드
node figma-cli.js run scripts/color-palette.js    # 색상 팔레트
```
