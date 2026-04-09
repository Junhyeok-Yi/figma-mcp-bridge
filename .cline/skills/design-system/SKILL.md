---
name: design-system
description: "DESIGN.md 기반 디자인 작업, 브랜드 토큰 적용, 디자인 시스템 참조 시 사용. 색상/타이포/간격 토큰 사용, 컴포넌트 패턴 적용 관련 작업에 활성화."
---

# Design System Guide

DESIGN.md에 정의된 브랜드 디자인 시스템을 Figma 작업에 적용하는 가이드.

## DESIGN.md 참조 방법

모든 디자인 작업 전 DESIGN.md를 반드시 읽는다:
```bash
cat DESIGN.md
```

## 토큰 → Figma 속성 매핑

### Colors

DESIGN.md 정의:
```markdown
- primary-500: #3B82F6
```

Figma 적용:
```js
node.fills = [{type: "SOLID", color: {r: 0.231, g: 0.510, b: 0.965}}];
```

HEX → RGB 변환:
```js
function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1,3), 16) / 255,
    g: parseInt(hex.slice(3,5), 16) / 255,
    b: parseInt(hex.slice(5,7), 16) / 255,
  };
}
```

### Typography

DESIGN.md 정의:
```markdown
- heading-1: Inter Bold 32px / line-height 40px
```

Figma 적용:
```js
await figma.loadFontAsync({family: "Inter", style: "Bold"});
text.fontName = {family: "Inter", style: "Bold"};
text.fontSize = 32;
text.lineHeight = {unit: "PIXELS", value: 40};
```

### Spacing

DESIGN.md 정의:
```markdown
- spacing-xs: 4px
- spacing-sm: 8px
- spacing-md: 16px
- spacing-lg: 24px
- spacing-xl: 32px
```

Figma 적용:
```js
frame.paddingTop = frame.paddingBottom = 16;  // spacing-md
frame.paddingLeft = frame.paddingRight = 16;
frame.itemSpacing = 8;  // spacing-sm
```

### Border Radius

DESIGN.md 정의:
```markdown
- radius-sm: 6px
- radius-md: 10px
- radius-lg: 16px
```

Figma 적용:
```js
frame.cornerRadius = 10;  // radius-md
```

### Shadows

DESIGN.md 정의:
```markdown
- shadow-sm: 0 1px 2px rgba(0,0,0,0.04)
- shadow-md: 0 4px 12px rgba(0,0,0,0.06)
```

Figma 적용:
```js
frame.effects = [
  {type: "DROP_SHADOW", color: {r:0,g:0,b:0,a:0.04}, offset: {x:0,y:1}, radius: 2, spread: 0, visible: true, blendMode: "NORMAL"},
  {type: "DROP_SHADOW", color: {r:0,g:0,b:0,a:0.06}, offset: {x:0,y:4}, radius: 12, spread: -2, visible: true, blendMode: "NORMAL"},
];
```

## 컴포넌트 패턴

### Card
```js
const card = figma.createFrame();
card.resize(320, 10);
card.layoutMode = "VERTICAL";
card.primaryAxisSizingMode = "AUTO";
card.counterAxisSizingMode = "FIXED";
card.paddingLeft = card.paddingRight = 20;  // DESIGN.md spacing
card.paddingTop = card.paddingBottom = 20;
card.itemSpacing = 14;
card.cornerRadius = 16;                     // DESIGN.md radius
card.fills = [{type: "SOLID", color: hexToRgb(DESIGN.colors.surface)}];
card.effects = DESIGN.shadows.md;           // DESIGN.md shadow
```

### Button
```js
const btn = figma.createFrame();
btn.layoutMode = "HORIZONTAL";
btn.primaryAxisSizingMode = "AUTO";
btn.counterAxisSizingMode = "AUTO";
btn.primaryAxisAlignItems = "CENTER";
btn.counterAxisAlignItems = "CENTER";
btn.paddingLeft = btn.paddingRight = 20;
btn.paddingTop = btn.paddingBottom = 10;
btn.cornerRadius = 10;
btn.fills = [{type: "SOLID", color: hexToRgb(DESIGN.colors.primary500)}];
```

### Input
```js
const field = figma.createFrame();
field.layoutMode = "HORIZONTAL";
field.primaryAxisSizingMode = "AUTO";
field.counterAxisSizingMode = "AUTO";
field.counterAxisAlignItems = "CENTER";
field.paddingLeft = field.paddingRight = 14;
field.paddingTop = field.paddingBottom = 11;
field.cornerRadius = 10;
field.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
field.strokes = [{type: "SOLID", color: hexToRgb(DESIGN.colors.border)}];
field.strokeWeight = 1.5;
```

## DESIGN.md가 없을 때

DESIGN.md가 프로젝트 루트에 없으면:
1. 사용자에게 DESIGN.md 생성을 제안한다
2. 기본 토큰으로 작업하되, 사용자에게 "기본 토큰을 사용합니다"라고 알린다
3. 절대로 임의의 색상/폰트를 추측해서 사용하지 않는다
