# Design System Tokens

이 문서는 Figma 디자인 작업 시 사용할 표준 디자인 토큰을 정의합니다.
Cline/AI 에이전트는 이 토큰을 참조하여 일관된 디자인을 생성해야 합니다.

> **사용법**: 프로젝트별로 이 파일을 수정하여 실제 디자인 시스템에 맞춰 사용하세요.

---

## Colors

### Primitive Colors (HEX)
```
white:       #FFFFFF
black:       #0A0A0A  (순수 #000000 사용 금지 — 틴티드 다크 사용)
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
gray-950:    #09090B  (다크 모드 배경용)
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

### Color Principles
- **싱글 액센트**: 페이지당 액센트 컬러 최대 1개. 채도 80% 미만 유지.
- **틴티드 쉐도우**: 그림자에 generic black 대신 배경 색조를 반영한다 (파란 배경 → 파란 기미 쉐도우).
- **AI 퍼플 금지**: 보라/파란 "AI 느낌" 그래디언트, 네온 글로우 사용 금지.
- **따뜻/차가운 혼용 금지**: 한 페이지에서 warm gray와 cool gray를 혼합하지 않는다.

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
- Primary (한국어): **Pretendard** (한국어 최적화 폰트, Figma 기본 지원)
- Primary (영문): **Inter** (영문 본문용)
- Display (영문 헤드라인): **Geist**, **Outfit**, **Satoshi** 중 선택
- Monospace: **JetBrains Mono** (코드 블록용)

### 한국어 타이포그래피 규칙 (필수)
- **줄간격**: 한국어 헤드라인은 `leading-tight` ~ `leading-snug` (120%~130%) 사용. Latin보다 수직 여백이 더 필요하다. `leading-none` 금지.
- **자간**: 한국어 본문은 letter-spacing 0 또는 -1% 유지. 영문 디스플레이는 -2%~-4% tight 가능.
- **줄바꿈**: 한국어 텍스트 블록에 word-break: keep-all 적용 (단어 중간 줄바꿈 방지). Figma에서는 텍스트 프레임 너비 조절로 관리.
- **본문 최대 너비**: 한국어 본문은 최대 40자(~640px at 16px) 권장. 너무 넓으면 가독성 저하.

### Type Scale
```
display-lg:   fontSize: 48, lineHeight: 60, fontStyle: "Bold"     (한국어: 125% lh)
display-md:   fontSize: 36, lineHeight: 46, fontStyle: "Bold"     (한국어: 128% lh)
heading-xl:   fontSize: 30, lineHeight: 40, fontStyle: "Bold"     (한국어: 133% lh)
heading-lg:   fontSize: 24, lineHeight: 32, fontStyle: "Semibold"
heading-md:   fontSize: 20, lineHeight: 28, fontStyle: "Semibold"
heading-sm:   fontSize: 16, lineHeight: 24, fontStyle: "Semibold"
body-lg:      fontSize: 18, lineHeight: 28, fontStyle: "Regular"
body-md:      fontSize: 16, lineHeight: 24, fontStyle: "Regular"
body-sm:      fontSize: 14, lineHeight: 20, fontStyle: "Regular"
caption:      fontSize: 12, lineHeight: 16, fontStyle: "Regular"
overline:     fontSize: 12, lineHeight: 16, fontStyle: "Medium", textCase: "UPPER"
```

### 한국어 콘텐츠 품질 규칙
- **자연스러운 한국어**: 번역체 금지. "시작을 하세요 지금" → "지금 시작하세요"
- **존댓말 통일**: 합니다/하세요 중 하나로 일관 유지. 반말과 혼용 금지.
- **AI 클리셰 금지**: "혁신적인", "획기적인", "차세대", "원활한", "게임 체인저" 사용 금지. 구체적이고 명확한 표현 사용.
- **CTA 카피**: 직접적 행동 유도 — "무료로 시작하기", "3분만에 만들어보기"
- **실감나는 데이터**: 둥근 숫자 금지 — `47,200+` (O), `50,000+` (X). `4.87` (O), `5.0` (X)

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

### Standard Shadows
```
shadow-sm:     [{type: "DROP_SHADOW", color: {r:0, g:0, b:0, a:0.05}, offset: {x:0, y:1},  radius: 2,  spread: 0, visible: true, blendMode: "NORMAL"}]
shadow-md:     [{type: "DROP_SHADOW", color: {r:0, g:0, b:0, a:0.1},  offset: {x:0, y:4},  radius: 6,  spread: 0, visible: true, blendMode: "NORMAL"}]
shadow-lg:     [{type: "DROP_SHADOW", color: {r:0, g:0, b:0, a:0.1},  offset: {x:0, y:10}, radius: 15, spread: 0, visible: true, blendMode: "NORMAL"}]
shadow-xl:     [{type: "DROP_SHADOW", color: {r:0, g:0, b:0, a:0.1},  offset: {x:0, y:20}, radius: 25, spread: 0, visible: true, blendMode: "NORMAL"}]
```

### Premium Shadows (틴티드)
배경 색조에 따라 그림자 색상을 조절한다:
```
shadow-ambient:  [{type: "DROP_SHADOW", color: {r:0, g:0, b:0, a:0.04}, offset: {x:0, y:20}, radius: 60, spread: -15, visible: true, blendMode: "NORMAL"}]
shadow-glass:    [{type: "DROP_SHADOW", color: {r:1, g:1, b:1, a:0.1},  offset: {x:0, y:1},  radius: 0,  spread: 0, visible: true, blendMode: "NORMAL"},
                  {type: "INNER_SHADOW", color: {r:1, g:1, b:1, a:0.15}, offset: {x:0, y:1},  radius: 1,  spread: 0, visible: true, blendMode: "NORMAL"}]
```

### Glass / Frosted Effect (다크 모드)
```js
// 글래스 카드: backdrop-blur 효과를 레이어로 구현
{
  fills: [{type: "SOLID", color: {r: 1, g: 1, b: 1}, opacity: 0.05}],
  strokes: [{type: "SOLID", color: {r: 1, g: 1, b: 1}, opacity: 0.1}],
  strokeWeight: 1,
  effects: [{type: "BACKGROUND_BLUR", radius: 40, visible: true},
            {type: "INNER_SHADOW", color: {r:1,g:1,b:1,a:0.15}, offset: {x:0,y:1}, radius: 1, spread: 0, visible: true, blendMode: "NORMAL"}]
}
```

---

## Common Component Patterns

### Card (Standard)
```js
// Auto-layout: VERTICAL, padding: 16, gap: 12, radius: 12
// Background: bg-primary (#FFFFFF), shadow: shadow-md
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

### Card (Double-Bezel Premium)
```js
// 외부 쉘(Outer Shell) + 내부 코어(Inner Core) 2중 구조
// 하드웨어를 연상시키는 프리미엄 카드. 유리판이 알루미늄 트레이에 놓인 느낌.
// Outer Shell:
{
  layoutMode: "VERTICAL",
  primaryAxisSizingMode: "AUTO",
  counterAxisSizingMode: "FIXED",
  paddingLeft: 6, paddingRight: 6, paddingTop: 6, paddingBottom: 6,
  cornerRadius: 24,
  fills: [{type: "SOLID", color: {r: 1, g: 1, b: 1}, opacity: 0.05}],
  strokes: [{type: "SOLID", color: {r: 1, g: 1, b: 1}, opacity: 0.1}],
  strokeWeight: 1
}
// Inner Core (Outer Shell의 자식):
{
  layoutMode: "VERTICAL",
  primaryAxisSizingMode: "AUTO",
  paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24,
  itemSpacing: 16,
  cornerRadius: 20,  // calc(24 - 6 + 2)
  fills: [{type: "SOLID", color: {r: 1, g: 1, b: 1}}],
  effects: [{type: "INNER_SHADOW", color: {r:1,g:1,b:1,a:0.15}, offset: {x:0,y:1}, radius: 1, spread: 0, visible: true, blendMode: "NORMAL"}]
}
```

### Button (Primary)
```js
// Auto-layout: HORIZONTAL, center-center, padding: [8, 16], radius: 8
// Background: primary (#3B82F6), Text: white, font: Pretendard/Medium 14
{
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "CENTER",
  counterAxisAlignItems: "CENTER",
  paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
  cornerRadius: 8,
  fills: [{type: "SOLID", color: {r: 0.231, g: 0.51, b: 0.965}}]
}
```

### Button (CTA Premium — Pill)
```js
// Pill 형태 + 아이콘 서클 래핑. 충분한 터치 영역 확보.
// 버튼 외부:
{
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "CENTER",
  counterAxisAlignItems: "CENTER",
  paddingLeft: 32, paddingRight: 8, paddingTop: 16, paddingBottom: 16,
  itemSpacing: 12,
  cornerRadius: 9999,
  fills: [{type: "SOLID", color: {r: 0.231, g: 0.51, b: 0.965}}]
}
// 아이콘 래퍼 (버튼 내부 우측):
{
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "CENTER",
  counterAxisAlignItems: "CENTER",
  width: 32, height: 32,
  cornerRadius: 9999,
  fills: [{type: "SOLID", color: {r: 0, g: 0, b: 0}, opacity: 0.1}]
}
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

### Eyebrow Tag (섹션 상단 태그)
```js
// 섹션 제목 위에 배치하는 작은 pill 뱃지
{
  layoutMode: "HORIZONTAL",
  primaryAxisAlignItems: "CENTER",
  counterAxisAlignItems: "CENTER",
  paddingLeft: 12, paddingRight: 12, paddingTop: 4, paddingBottom: 4,
  cornerRadius: 9999,
  fills: [{type: "SOLID", color: {r: 0.231, g: 0.51, b: 0.965}, opacity: 0.1}]
}
// Text: fontSize 11, fontStyle: "Medium", letterSpacing: {unit: "PERCENT", value: 15}, textCase: "UPPER"
```

---

## Layout Guidelines

### Page Structure
- Max content width: 1200px (desktop), 100% (mobile)
- Section spacing: 48px~80px vertical (프리미엄: 넉넉하게 숨 쉬는 여백)
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

---

## Anti-Generic Design Principles (AI 디자인 품질 규칙)

AI가 생성하는 디자인의 "템플릿 냄새"를 제거하기 위한 필수 규칙.

### Layout Diversification
- **3열 동일 카드 금지**: Feature 섹션에서 3개 같은 크기 카드를 나란히 배치하지 않는다. 대신 벤토 그리드(비대칭 크기), 지그재그, 수평 스크롤 사용.
- **인접 섹션 동일 레이아웃 금지**: Hero(스플릿) → Features(벤토) → Testimonials(매이슨리) → CTA(풀블리드) 등 각 섹션마다 다른 패턴.
- **중앙 정렬 편향 주의**: DESIGN_VARIANCE가 높을 때 모든 섹션을 중앙 정렬하지 않는다. 비대칭 여백, 스플릿 스크린, 오프셋 마진 활용.

### Visual Anti-Patterns (사용 금지)
- 순수 #000000 배경 → `#0A0A0A`, `#09090B` 등 틴티드 다크 사용
- 과채도 액센트 → 채도 80% 미만으로 톤다운
- 보라/파란 AI 그래디언트 → 중성 기반 + 단일 액센트
- 네온/외부 글로우 → 내부 보더 또는 틴티드 쉐도우 사용
- 그래디언트 텍스트 남발 → 페이지당 최대 1개

### Section Pattern Library (Figma용)
```
Hero 패턴:
  - Split Hero: 60/40 텍스트+비주얼 분할
  - Statement Hero: 초대형 타이포 + 극단적 여백
  - Full-Bleed Media: 전면 이미지 + 텍스트 오버레이

Feature 패턴:
  - Bento Grid: 비대칭 그리드 (2fr 1fr 1fr)
  - Zig-Zag: 이미지-텍스트 교차 배치
  - Icon Strip: 수평 아이콘 스트립 + 호버 상세

Social Proof 패턴:
  - Logo Cloud: 그레이스케일 로고 스트립
  - Testimonial Masonry: 엇갈린 높이 카드
  - Metrics Bar: 대형 숫자 카운터

CTA 패턴:
  - Full-Bleed CTA: 다크 배경 + 글로잉 버튼
  - Sticky Bottom: 스크롤 후 나타나는 하단 고정 바
```
