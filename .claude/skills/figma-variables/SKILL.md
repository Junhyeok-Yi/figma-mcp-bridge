---
name: figma-variables
description: "Figma 변수/토큰 생성, 컬렉션 관리, 노드에 변수 바인딩 시 사용. 디자인 토큰 등록, 색상 변수, 테마 모드 관련 작업에 활성화."
---

# Figma Variables API Guide

Figma Variables(변수)를 사용하여 디자인 토큰을 관리하는 가이드.

## 개념

- **Variable**: 하나의 디자인 토큰 (색상, 숫자, 문자열, 불리언)
- **Variable Collection**: 변수들의 그룹 (예: "Colors", "Spacing")
- **Mode**: 같은 변수의 다른 값 세트 (예: Light/Dark 테마)

## 변수 조회

```js
// 모든 로컬 변수
const vars = await figma.variables.getLocalVariablesAsync();
// 타입별 필터 (COLOR, FLOAT, STRING, BOOLEAN)
const colors = await figma.variables.getLocalVariablesAsync("COLOR");

// 모든 컬렉션
const collections = await figma.variables.getLocalVariableCollectionsAsync();

// ID로 조회
const variable = await figma.variables.getVariableByIdAsync("VariableID:123");
const collection = await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:456");
```

## 컬렉션 생성

```js
const collection = figma.variables.createVariableCollection("Colors");
// collection.id, collection.name, collection.modes, collection.defaultModeId
```

## 변수 생성

```js
// COLOR 변수
const primary = figma.variables.createVariable("primary-500", collection, "COLOR");
primary.setValueForMode(collection.defaultModeId, {r: 0.231, g: 0.510, b: 0.965, a: 1});

// FLOAT 변수 (spacing, radius 등)
const spacing = figma.variables.createVariable("spacing-md", collection, "FLOAT");
spacing.setValueForMode(collection.defaultModeId, 16);

// STRING 변수
const fontFamily = figma.variables.createVariable("font-body", collection, "STRING");
fontFamily.setValueForMode(collection.defaultModeId, "Inter");
```

## 다크 모드 (Multi-mode)

```js
const collection = figma.variables.createVariableCollection("Theme");
// 기본 모드 이름 변경
collection.renameMode(collection.defaultModeId, "Light");
// 새 모드 추가
const darkModeId = collection.addMode("Dark");

const bg = figma.variables.createVariable("bg-primary", collection, "COLOR");
bg.setValueForMode(collection.defaultModeId, {r: 1, g: 1, b: 1, a: 1});      // Light: white
bg.setValueForMode(darkModeId, {r: 0.067, g: 0.094, b: 0.153, a: 1});        // Dark: dark blue
```

## 노드에 변수 바인딩

```js
const node = await figma.getNodeByIdAsync("1:23");
const variable = await figma.variables.getVariableByIdAsync("VariableID:123");

// fills에 바인딩
const fills = JSON.parse(JSON.stringify(node.fills));
fills[0] = figma.variables.setBoundVariableForPaint(fills[0], "color", variable);
node.fills = fills;

// 다른 속성에 바인딩
node.setBoundVariable("width", variable);
node.setBoundVariable("itemSpacing", variable);
node.setBoundVariable("paddingLeft", variable);
```

## HEX → RGB 변환 헬퍼

```js
function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1,3), 16) / 255;
  const g = parseInt(hex.slice(3,5), 16) / 255;
  const b = parseInt(hex.slice(5,7), 16) / 255;
  return {r, g, b, a: alpha};
}
```

## 일괄 등록 패턴

DESIGN.md에서 색상을 파싱하여 일괄 등록하는 패턴:

```js
const collection = figma.variables.createVariableCollection("Brand Colors");

const tokens = [
  {name: "primary/50", hex: "#EFF6FF"},
  {name: "primary/500", hex: "#3B82F6"},
  {name: "primary/900", hex: "#1E3A5F"},
  {name: "neutral/50", hex: "#F8FAFC"},
  {name: "neutral/900", hex: "#0F172A"},
];

const results = [];
for (const t of tokens) {
  const v = figma.variables.createVariable(t.name, collection, "COLOR");
  v.setValueForMode(collection.defaultModeId, hexToRgba(t.hex));
  results.push({name: t.name, id: v.id});
}
return {collectionId: collection.id, count: results.length, variables: results};
```

## 주의사항

- 변수 이름에 `/`를 사용하면 Figma UI에서 그룹으로 표시됨 (예: `primary/500`)
- COLOR 변수의 값은 반드시 `{r, g, b, a}` 형식 (0~1 범위)
- 컬렉션당 모드는 최대 4개 (Free plan 기준)
- `setBoundVariable`는 FLOAT 타입 변수만 지원하는 속성이 많음
