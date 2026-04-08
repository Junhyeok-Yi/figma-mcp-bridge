# Design System Tokens

이 문서는 Figma 디자인 작업 시 사용할 표준 디자인 토큰을 정의합니다.
Cline/AI 에이전트는 이 토큰을 참조하여 일관된 디자인을 생성해야 합니다.

> **사용법**: 프로젝트별로 이 파일을 수정하여 실제 디자인 시스템에 맞춰 사용하세요.

---

## Colors

### Primitive Colors (HEX)
```
white:       #FFFFFF
black:       #000000
gray-50:     #F9FAFB
gray-100:    #F3F4F6
gray-200:    #E5E7EB
gray-300:    #D1D5DB
gray-400:    #9CA3AF
gray-500:    #6B7280
gray-600:    #4B5563
gray-700:    #374151
gray-800:    #1F2937
gray-900:    #111827
```

### Semantic Colors
```
primary:         #3B82F6   (Blue-500)
primary-hover:   #2563EB   (Blue-600)
primary-light:   #EFF6FF   (Blue-50)
secondary:       #6B7280   (Gray-500)
success:         #10B981   (Green-500)
warning:         #F59E0B   (Amber-500)
error:           #EF4444   (Red-500)
info:            #3B82F6   (Blue-500)
```

### Text Colors
```
text-primary:    #111827   (Gray-900)
text-secondary:  #6B7280   (Gray-500)
text-tertiary:   #9CA3AF   (Gray-400)
text-inverse:    #FFFFFF
text-link:       #3B82F6
```

### Background Colors
```
bg-primary:      #FFFFFF
bg-secondary:    #F9FAFB   (Gray-50)
bg-tertiary:     #F3F4F6   (Gray-100)
bg-inverse:      #111827   (Gray-900)
bg-overlay:      rgba(0,0,0,0.5)
```

### Border Colors
```
border-default:  #E5E7EB   (Gray-200)
border-strong:   #D1D5DB   (Gray-300)
border-focus:    #3B82F6   (Primary)
```

---

## Typography

### Font Family
- Primary: **Inter**
- Monospace: **JetBrains Mono** (코드 블록용)

### Type Scale
```
display-lg:   fontSize: 48, lineHeight: 56, fontStyle: "Bold"
display-md:   fontSize: 36, lineHeight: 44, fontStyle: "Bold"
heading-xl:   fontSize: 30, lineHeight: 36, fontStyle: "Bold"
heading-lg:   fontSize: 24, lineHeight: 32, fontStyle: "Semibold"
heading-md:   fontSize: 20, lineHeight: 28, fontStyle: "Semibold"
heading-sm:   fontSize: 16, lineHeight: 24, fontStyle: "Semibold"
body-lg:      fontSize: 18, lineHeight: 28, fontStyle: "Regular"
body-md:      fontSize: 16, lineHeight: 24, fontStyle: "Regular"
body-sm:      fontSize: 14, lineHeight: 20, fontStyle: "Regular"
caption:      fontSize: 12, lineHeight: 16, fontStyle: "Regular"
overline:     fontSize: 12, lineHeight: 16, fontStyle: "Medium", textCase: "UPPER"
```

---

## Spacing

### Base Unit: 4px

```
spacing-0:    0
spacing-1:    4
spacing-2:    8
spacing-3:    12
spacing-4:    16
spacing-5:    20
spacing-6:    24
spacing-8:    32
spacing-10:   40
spacing-12:   48
spacing-16:   64
spacing-20:   80
```

### Component Padding Presets
```
button-padding:    [8, 16, 8, 16]     (top, right, bottom, left)
card-padding:      [16, 16, 16, 16]
card-padding-lg:   [24, 24, 24, 24]
input-padding:     [8, 12, 8, 12]
modal-padding:     [24, 24, 24, 24]
section-padding:   [48, 24, 48, 24]
```

---

## Border Radius

```
radius-none:   0
radius-sm:     4
radius-md:     8
radius-lg:     12
radius-xl:     16
radius-2xl:    24
radius-full:   9999
```

---

## Shadows / Effects

```
shadow-sm:     [{type: "DROP_SHADOW", color: {r:0, g:0, b:0, a:0.05}, offset: {x:0, y:1},  radius: 2,  spread: 0, visible: true, blendMode: "NORMAL"}]
shadow-md:     [{type: "DROP_SHADOW", color: {r:0, g:0, b:0, a:0.1},  offset: {x:0, y:4},  radius: 6,  spread: 0, visible: true, blendMode: "NORMAL"}]
shadow-lg:     [{type: "DROP_SHADOW", color: {r:0, g:0, b:0, a:0.1},  offset: {x:0, y:10}, radius: 15, spread: 0, visible: true, blendMode: "NORMAL"}]
shadow-xl:     [{type: "DROP_SHADOW", color: {r:0, g:0, b:0, a:0.1},  offset: {x:0, y:20}, radius: 25, spread: 0, visible: true, blendMode: "NORMAL"}]
```

---

## Common Component Patterns

### Card
```js
// Auto-layout: VERTICAL, padding: 16, gap: 12, radius: 12
// Background: bg-primary (#FFFFFF), shadow: shadow-md
// Width: FIXED (320 or parent), Height: AUTO
{
  layoutMode: "VERTICAL",
  primaryAxisSizingMode: "AUTO",
  counterAxisSizingMode: "FIXED",
  paddingLeft: 16, paddingRight: 16, paddingTop: 16, paddingBottom: 16,
  itemSpacing: 12,
  cornerRadius: 12,
  fills: [{type: "SOLID", color: {r: 1, g: 1, b: 1}}],
  effects: [{type: "DROP_SHADOW", color: {r:0, g:0, b:0, a:0.1}, offset: {x:0, y:4}, radius: 6, visible: true}]
}
```

### Button (Primary)
```js
// Auto-layout: HORIZONTAL, center-center, padding: [8, 16], radius: 8
// Background: primary (#3B82F6), Text: white, font: Inter/Medium 14
{
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "CENTER",
  counterAxisAlignItems: "CENTER",
  paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
  cornerRadius: 8,
  fills: [{type: "SOLID", color: {r: 0.231, g: 0.51, b: 0.965}}]
}
// Text: fontSize 14, fontName: {family: "Inter", style: "Medium"}, color: #FFFFFF
```

### Input Field
```js
// Auto-layout: HORIZONTAL, padding: [8, 12], radius: 8
// Border: border-default (#E5E7EB) 1px, Background: white
{
  layoutMode: "HORIZONTAL",
  counterAxisAlignItems: "CENTER",
  paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
  cornerRadius: 8,
  fills: [{type: "SOLID", color: {r: 1, g: 1, b: 1}}],
  strokes: [{type: "SOLID", color: {r: 0.898, g: 0.906, b: 0.922}}],
  strokeWeight: 1
}
```

### List Item
```js
// Auto-layout: HORIZONTAL, padding: [12, 16], gap: 12
// Hover: bg-secondary (#F9FAFB)
{
  layoutMode: "HORIZONTAL",
  counterAxisAlignItems: "CENTER",
  paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
  itemSpacing: 12,
  fills: [{type: "SOLID", color: {r: 1, g: 1, b: 1}}]
}
```

---

## Layout Guidelines

### Page Structure
- Max content width: 1200px (desktop), 100% (mobile)
- Section spacing: 48px vertical
- Grid: 12-column, 24px gutter, 24px margin

### Responsive Breakpoints
```
mobile:    width <= 640
tablet:    641 <= width <= 1024
desktop:   width > 1024
```

### Auto-Layout Best Practices
1. Always use VERTICAL or HORIZONTAL layoutMode for containers
2. Use `primaryAxisSizingMode: "AUTO"` for content that grows
3. Use `counterAxisSizingMode: "FIXED"` for width-constrained containers
4. Prefer `itemSpacing` over manual positioning
5. Use consistent padding from the spacing scale above
