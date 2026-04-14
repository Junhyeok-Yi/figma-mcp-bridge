---
name: design-system
description: "DESIGN.md 기반 디자인 작업, 브랜드 토큰 적용, 디자인 시스템 참조 시 사용. 색상/타이포/간격 토큰 사용, 컴포넌트 패턴 적용 관련 작업에 활성화."
---

# Design System Guide

DESIGN.md에 정의된 브랜드 디자인 시스템을 Figma 작업에 적용하는 가이드.
토큰 값은 DESIGN.md가 정본(SSOT)이다. 이 스킬은 **적용 방법**만 다룬다.

## DESIGN.md 참조 방법

모든 디자인 작업 전 DESIGN.md를 반드시 읽는다:
```bash
node figma-cli.js eval "return 'ready'" && cat DESIGN.md
```

## HEX → RGB 변환

DESIGN.md는 HEX, Figma API는 0~1 RGB를 사용한다:
```js
function hexToRgb(hex) {
  hex = hex.replace("#", "");
  return {
    r: parseInt(hex.slice(0,2), 16) / 255,
    g: parseInt(hex.slice(2,4), 16) / 255,
    b: parseInt(hex.slice(4,6), 16) / 255,
  };
}
```

## 토큰 적용 예시

### Color
```js
node.fills = [{type: "SOLID", color: hexToRgb("#3B82F6")}];  // primary
```

### Typography
```js
await figma.loadFontAsync({family: "Inter", style: "Bold"});
text.fontName = {family: "Inter", style: "Bold"};
text.fontSize = 32;
text.lineHeight = {unit: "PIXELS", value: 40};
```

### Spacing & Radius
```js
frame.paddingTop = frame.paddingBottom = 16;  // spacing-4
frame.paddingLeft = frame.paddingRight = 16;
frame.itemSpacing = 8;                        // spacing-2
frame.cornerRadius = 8;                       // radius-md
```

### Shadows
```js
frame.effects = [{
  type: "DROP_SHADOW",
  color: {r:0, g:0, b:0, a:0.1},
  offset: {x:0, y:4}, radius: 6, spread: 0,
  visible: true, blendMode: "NORMAL"
}];
```

## DESIGN.md가 없을 때

DESIGN.md가 프로젝트 루트에 없으면:
1. 사용자에게 DESIGN.md 생성을 제안한다
2. 기본 토큰으로 작업하되, 사용자에게 "기본 토큰을 사용합니다"라고 알린다
3. 절대로 임의의 색상/폰트를 추측해서 사용하지 않는다
