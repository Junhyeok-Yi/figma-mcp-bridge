// Template: Card — {{title}}
// Params: title, desc, button, w, parent, x, y

await figma.loadFontAsync({family: "Inter", style: "Semi Bold"});
await figma.loadFontAsync({family: "Inter", style: "Regular"});

const card = figma.createFrame();
card.name = "{{title|Card}}";
card.resize({{w|320}}, 10);
card.layoutMode = "VERTICAL";
card.primaryAxisSizingMode = "AUTO";
card.counterAxisSizingMode = "FIXED";
card.paddingLeft = card.paddingRight = card.paddingTop = card.paddingBottom = 16;
card.itemSpacing = 12;
card.cornerRadius = 12;
card.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
card.effects = [{type: "DROP_SHADOW", color: {r:0, g:0, b:0, a:0.08}, offset: {x:0, y:4}, radius: 6, spread: 0, visible: true, blendMode: "NORMAL"}];
card.x = {{x|0}};
card.y = {{y|0}};

const titleNode = figma.createText();
titleNode.fontName = {family: "Inter", style: "Semi Bold"};
titleNode.fontSize = 18;
titleNode.characters = "{{title|Card}}";
titleNode.fills = [{type: "SOLID", color: {r: 0.067, g: 0.094, b: 0.153}}];
card.appendChild(titleNode);
titleNode.layoutSizingHorizontal = "FILL";

const descNode = figma.createText();
descNode.fontName = {family: "Inter", style: "Regular"};
descNode.fontSize = 14;
descNode.lineHeight = {unit: "PIXELS", value: 20};
descNode.characters = "{{desc|Description text goes here.}}";
descNode.fills = [{type: "SOLID", color: {r: 0.420, g: 0.447, b: 0.498}}];
descNode.textAutoResize = "HEIGHT";
card.appendChild(descNode);
descNode.layoutSizingHorizontal = "FILL";

const btnText = "{{button|}}";
if (btnText) {
  const btn = figma.createFrame();
  btn.name = "Button";
  btn.layoutMode = "HORIZONTAL";
  btn.primaryAxisAlignItems = "CENTER";
  btn.counterAxisAlignItems = "CENTER";
  btn.paddingLeft = btn.paddingRight = 16;
  btn.paddingTop = btn.paddingBottom = 8;
  btn.cornerRadius = 8;
  btn.fills = [{type: "SOLID", color: {r: 0.231, g: 0.510, b: 0.965}}];
  const bt = figma.createText();
  bt.fontName = {family: "Inter", style: "Semi Bold"};
  bt.fontSize = 14;
  bt.characters = btnText;
  bt.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
  btn.appendChild(bt);
  card.appendChild(btn);
  btn.layoutSizingHorizontal = "FILL";
}

const parentId = "{{parent|}}";
if (parentId) {
  const p = await figma.getNodeByIdAsync(parentId);
  if (p && "appendChild" in p) { p.appendChild(card); card.layoutSizingHorizontal = "FILL"; }
}

figma.currentPage.selection = [card];
figma.viewport.scrollAndZoomIntoView([card]);
return {id: card.id, name: card.name, w: card.width, h: card.height};
