# Register Colors Workflow

DESIGN.md에 정의된 색상 토큰을 Figma 변수(Variables)로 일괄 등록하는 워크플로우.

## Step 1: 연결 확인
```bash
node figma-cli.js status
```

## Step 2: DESIGN.md 읽기
```bash
cat DESIGN.md
```
Colors 섹션에서 색상 토큰을 파싱한다.

예상 형식:
```markdown
## Colors
### Primary
- primary-50: #EFF6FF
- primary-100: #DBEAFE
- primary-500: #3B82F6
- primary-900: #1E3A5F
```

## Step 3: 기존 변수 확인
```bash
node figma-cli.js eval 'const cols = await figma.variables.getLocalVariableCollectionsAsync(); return cols.map(c => ({id: c.id, name: c.name, modes: c.modes, variableCount: c.variableIds.length}));'
```
이미 동일한 이름의 컬렉션이 있으면 사용자에게 확인:
- 기존 컬렉션에 추가할 것인지
- 기존 컬렉션을 삭제하고 새로 만들 것인지
- 취소할 것인지

## Step 4: 색상 토큰 → 변수 생성 스크립트 작성
`.js` 파일을 작성한다:

```js
// register-colors-output.js 예시 구조
const collection = figma.variables.createVariableCollection("Colors");

// DESIGN.md에서 파싱한 색상 목록
const colors = [
  {name: "primary/50", hex: "#EFF6FF"},
  {name: "primary/500", hex: "#3B82F6"},
  // ...
];

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16) / 255;
  const g = parseInt(hex.slice(3,5), 16) / 255;
  const b = parseInt(hex.slice(5,7), 16) / 255;
  return {r, g, b};
}

const results = [];
for (const c of colors) {
  const v = figma.variables.createVariable(c.name, collection, "COLOR");
  v.setValueForMode(collection.defaultModeId, {...hexToRgb(c.hex), a: 1});
  results.push({name: c.name, id: v.id});
}
return {collection: collection.id, variables: results};
```

## Step 5: 실행
```bash
node figma-cli.js run register-colors-output.js
```

## Step 6: 검증
등록된 변수를 확인:
```bash
node figma-cli.js eval 'const vars = await figma.variables.getLocalVariablesAsync("COLOR"); return vars.map(v => ({id: v.id, name: v.name}));'
```

DESIGN.md의 색상 수와 등록된 변수 수를 비교하여 누락 여부를 확인한다.

## Step 7: 결과 보고
- 생성된 컬렉션 이름과 ID
- 등록된 변수 총 개수
- DESIGN.md 대비 매핑 성공률
- 누락된 색상이 있으면 목록 제시
