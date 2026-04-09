---
paths:
  - "templates/**"
  - "scripts/**"
  - "*.js"
---

# Figma Write Rules

이 규칙은 Figma에 쓰기 작업(노드 생성/수정)을 할 때만 적용된다.

## Critical API Rules

1. **`resize()` MUST come BEFORE `primaryAxisSizingMode = "AUTO"`**.
   `resize()` 호출이 auto-sizing을 FIXED로 리셋한다:
   ```js
   // CORRECT
   frame.resize(320, 10);
   frame.layoutMode = "VERTICAL";
   frame.primaryAxisSizingMode = "AUTO";
   frame.counterAxisSizingMode = "FIXED";

   // WRONG — height stays at 10!
   frame.layoutMode = "VERTICAL";
   frame.primaryAxisSizingMode = "AUTO";
   frame.resize(320, 10);
   ```

2. **Every auto-layout frame needs EXPLICIT sizing modes.**
   Default is "FIXED" at 100x100. Always set both:
   ```js
   frame.layoutMode = "HORIZONTAL";
   frame.primaryAxisSizingMode = "AUTO";
   frame.counterAxisSizingMode = "AUTO";
   ```

3. **`layoutSizingHorizontal = "FILL"`** must be set AFTER appendChild:
   ```js
   parent.appendChild(child);
   child.layoutSizingHorizontal = "FILL";
   ```

4. **DROP_SHADOW** requires `blendMode`, `spread`, `visible`:
   ```js
   node.effects = [{type: "DROP_SHADOW", color: {r:0,g:0,b:0,a:0.1}, offset: {x:0,y:4}, radius: 6, spread: 0, visible: true, blendMode: "NORMAL"}];
   ```

5. **Font loading** must happen before any text manipulation:
   ```js
   await figma.loadFontAsync({family: "Inter", style: "Regular"});
   ```

6. **Node lookup** must use async version:
   ```js
   const node = await figma.getNodeByIdAsync("1:23");
   ```

## Common Patterns

**Auto-layout card:**
```js
const card = figma.createFrame();
card.name = "Card";
card.resize(320, 10);
card.layoutMode = "VERTICAL";
card.primaryAxisSizingMode = "AUTO";
card.counterAxisSizingMode = "FIXED";
card.paddingLeft = card.paddingRight = card.paddingTop = card.paddingBottom = 16;
card.itemSpacing = 8;
card.cornerRadius = 12;
card.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
```

**Add text to a parent:**
```js
await figma.loadFontAsync({family: "Inter", style: "Regular"});
const text = figma.createText();
text.characters = "Hello World";
text.fontSize = 16;
text.fills = [{type: "SOLID", color: {r: 0.1, g: 0.1, b: 0.1}}];
parent.appendChild(text);
text.layoutSizingHorizontal = "FILL";
```

## Templates

```
node figma-cli.js tpl card --title "Card" --desc "Description" --button "Action"
node figma-cli.js tpl button --text "Submit" --variant primary --size lg
node figma-cli.js tpl input --label "Email" --placeholder "name@co.com"
node figma-cli.js tpl list --items "Item 1,Item 2,Item 3"
node figma-cli.js tpl navbar --title "App" --items "Home,About,Contact"
node figma-cli.js tpl table --cols "Name,Email" --rows "John,john@test.com;Jane,jane@test.com"
```

All templates accept `--parent <nodeId>`, `--x`, `--y` flags.

## Pre-built Scripts

```
node figma-cli.js run scripts/login-page.js
node figma-cli.js run scripts/dashboard.js
node figma-cli.js run scripts/color-palette.js
```

## Batch with References

```json
[
  {"type": "CREATE_NODE", "payload": {"nodeType": "FRAME", "properties": {"name": "Parent"}}, "ref": "card"},
  {"type": "CREATE_NODE", "payload": {"nodeType": "TEXT", "textContent": "Title", "parentId": "$card.nodeId"}}
]
```
