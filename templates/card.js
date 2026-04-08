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
card.paddingLeft = card.paddingRight = 20;
card.paddingTop = card.paddingBottom = 20;
card.itemSpacing = 14;
card.cornerRadius = 16;
card.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
card.effects = [
  {type: "DROP_SHADOW", color: {r:0, g:0, b:0, a:0.04}, offset: {x:0, y:1}, radius: 2, spread: 0, visible: true, blendMode: "NORMAL"},
  {type: "DROP_SHADOW", color: {r:0, g:0, b:0, a:0.06}, offset: {x:0, y:4}, radius: 12, spread: -2, visible: true, blendMode: "NORMAL"},
];
card.strokes = [{type: "SOLID", color: {r: 0.933, g: 0.937, b: 0.945}}];
card.strokeWeight = 1;
card.x = {{x|0}};
card.y = {{y|0}};

const titleNode = figma.createText();
titleNode.fontName = {family: "Inter", style: "Semi Bold"};
titleNode.fontSize = 17;
titleNode.lineHeight = {unit: "PIXELS", value: 24};
titleNode.characters = "{{title|Card}}";
titleNode.fills = [{type: "SOLID", color: {r: 0.067, g: 0.094, b: 0.153}}];
card.appendChild(titleNode);
titleNode.layoutSizingHorizontal = "FILL";

const descNode = figma.createText();
descNode.fontName = {family: "Inter", style: "Regular"};
descNode.fontSize = 14;
descNode.lineHeight = {unit: "PIXELS", value: 22};
descNode.characters = "{{desc|Description text goes here.}}";
descNode.fills = [{type: "SOLID", color: {r: 0.380, g: 0.408, b: 0.459}}];
descNode.textAutoResize = "HEIGHT";
card.appendChild(descNode);
descNode.layoutSizingHorizontal = "FILL";

const btnLabel = "{{button|}}";
if (btnLabel) {
  const btn = figma.createFrame();
  btn.name = "Button";
  btn.layoutMode = "HORIZONTAL";
  btn.primaryAxisSizingMode = "AUTO";
  btn.counterAxisSizingMode = "AUTO";
  btn.primaryAxisAlignItems = "CENTER";
  btn.counterAxisAlignItems = "CENTER";
  btn.paddingLeft = btn.paddingRight = 20;
  btn.paddingTop = btn.paddingBottom = 10;
  btn.cornerRadius = 10;
  btn.fills = [{type: "SOLID", color: {r: 0.231, g: 0.510, b: 0.965}}];
  const bt = figma.createText();
  bt.fontName = {family: "Inter", style: "Semi Bold"};
  bt.fontSize = 14;
  bt.lineHeight = {unit: "PIXELS", value: 20};
  bt.characters = btnLabel;
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
