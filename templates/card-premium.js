// Template: Card (Double-Bezel Premium) — {{title}}
// Params: title, desc, tag, w, theme(light|dark), parent, x, y

await figma.loadFontAsync({family: "Inter", style: "Semi Bold"});
await figma.loadFontAsync({family: "Inter", style: "Regular"});
await figma.loadFontAsync({family: "Inter", style: "Medium"});

const theme = "{{theme|light}}";
const isDark = theme === "dark";

const outerBg = isDark
  ? {r: 1, g: 1, b: 1}
  : {r: 0, g: 0, b: 0};
const innerBg = isDark
  ? {r: 0.078, g: 0.078, b: 0.086}
  : {r: 1, g: 1, b: 1};
const ringColor = isDark
  ? {r: 1, g: 1, b: 1}
  : {r: 0, g: 0, b: 0};
const titleColor = isDark
  ? {r: 1, g: 1, b: 1}
  : {r: 0.067, g: 0.094, b: 0.153};
const descColor = isDark
  ? {r: 0.63, g: 0.63, b: 0.65}
  : {r: 0.38, g: 0.408, b: 0.459};
const tagBg = isDark
  ? {r: 1, g: 1, b: 1}
  : {r: 0.231, g: 0.51, b: 0.965};

// Outer Shell
const shell = figma.createFrame();
shell.name = "{{title|Card}}";
shell.resize({{w|360}}, 10);
shell.layoutMode = "VERTICAL";
shell.primaryAxisSizingMode = "AUTO";
shell.counterAxisSizingMode = "FIXED";
shell.paddingLeft = shell.paddingRight = 6;
shell.paddingTop = shell.paddingBottom = 6;
shell.cornerRadius = 24;
shell.fills = [{type: "SOLID", color: outerBg, opacity: 0.05}];
shell.strokes = [{type: "SOLID", color: ringColor, opacity: 0.1}];
shell.strokeWeight = 1;
shell.x = {{x|0}};
shell.y = {{y|0}};

// Inner Core
const core = figma.createFrame();
core.name = "Content";
core.layoutMode = "VERTICAL";
core.primaryAxisSizingMode = "AUTO";
core.counterAxisSizingMode = "FIXED";
core.paddingLeft = core.paddingRight = 24;
core.paddingTop = core.paddingBottom = 24;
core.itemSpacing = 14;
core.cornerRadius = 20;
core.fills = [{type: "SOLID", color: innerBg}];
core.effects = [
  {type: "INNER_SHADOW", color: {r:1, g:1, b:1, a: isDark ? 0.08 : 0.15}, offset: {x:0, y:1}, radius: 1, spread: 0, visible: true, blendMode: "NORMAL"},
];
shell.appendChild(core);
core.layoutSizingHorizontal = "FILL";

// Eyebrow Tag
const tagText = "{{tag|}}";
if (tagText) {
  const tag = figma.createFrame();
  tag.name = "Tag";
  tag.layoutMode = "HORIZONTAL";
  tag.primaryAxisSizingMode = "AUTO";
  tag.counterAxisSizingMode = "AUTO";
  tag.primaryAxisAlignItems = "CENTER";
  tag.counterAxisAlignItems = "CENTER";
  tag.paddingLeft = tag.paddingRight = 12;
  tag.paddingTop = tag.paddingBottom = 4;
  tag.cornerRadius = 9999;
  tag.fills = [{type: "SOLID", color: tagBg, opacity: isDark ? 0.1 : 0.1}];

  const tagLabel = figma.createText();
  tagLabel.fontName = {family: "Inter", style: "Medium"};
  tagLabel.fontSize = 11;
  tagLabel.lineHeight = {unit: "PIXELS", value: 16};
  tagLabel.characters = tagText.toUpperCase();
  tagLabel.letterSpacing = {unit: "PERCENT", value: 15};
  tagLabel.fills = [{type: "SOLID", color: isDark ? {r:1,g:1,b:1} : tagBg, opacity: isDark ? 0.7 : 1}];
  tag.appendChild(tagLabel);
  core.appendChild(tag);
}

// Title
const titleNode = figma.createText();
titleNode.fontName = {family: "Inter", style: "Semi Bold"};
titleNode.fontSize = 18;
titleNode.lineHeight = {unit: "PIXELS", value: 24};
titleNode.characters = "{{title|Card}}";
titleNode.fills = [{type: "SOLID", color: titleColor}];
core.appendChild(titleNode);
titleNode.layoutSizingHorizontal = "FILL";

// Description
const descNode = figma.createText();
descNode.fontName = {family: "Inter", style: "Regular"};
descNode.fontSize = 14;
descNode.lineHeight = {unit: "PIXELS", value: 22};
descNode.characters = "{{desc|Description text goes here.}}";
descNode.fills = [{type: "SOLID", color: descColor}];
descNode.textAutoResize = "HEIGHT";
core.appendChild(descNode);
descNode.layoutSizingHorizontal = "FILL";

const parentId = "{{parent|}}";
if (parentId) {
  const p = await figma.getNodeByIdAsync(parentId);
  if (p && "appendChild" in p) { p.appendChild(shell); shell.layoutSizingHorizontal = "FILL"; }
}

figma.currentPage.selection = [shell];
figma.viewport.scrollAndZoomIntoView([shell]);
return {id: shell.id, name: shell.name, w: shell.width, h: shell.height};
