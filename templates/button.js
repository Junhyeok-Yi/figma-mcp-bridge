// Template: Button — {{text}}
// Params: text, variant(primary|secondary|outline|ghost), size(sm|md|lg), parent, x, y

await figma.loadFontAsync({family: "Inter", style: "Medium"});

const variant = "{{variant|primary}}";
const size = "{{size|md}}";

const pad = {sm: [6, 12], md: [8, 16], lg: [12, 24]}[size] || [8, 16];
const fontSize = {sm: 12, md: 14, lg: 16}[size] || 14;

const colors = {
  primary:   {bg: {r:0.231,g:0.510,b:0.965}, text: {r:1,g:1,b:1}, stroke: null},
  secondary: {bg: {r:0.953,g:0.957,b:0.965}, text: {r:0.067,g:0.094,b:0.153}, stroke: null},
  outline:   {bg: null, text: {r:0.231,g:0.510,b:0.965}, stroke: {r:0.231,g:0.510,b:0.965}},
  ghost:     {bg: null, text: {r:0.231,g:0.510,b:0.965}, stroke: null},
};
const c = colors[variant] || colors.primary;

const btn = figma.createFrame();
btn.name = "{{text|Button}}";
btn.layoutMode = "HORIZONTAL";
btn.primaryAxisAlignItems = "CENTER";
btn.counterAxisAlignItems = "CENTER";
btn.paddingTop = btn.paddingBottom = pad[0];
btn.paddingLeft = btn.paddingRight = pad[1];
btn.cornerRadius = 8;
btn.fills = c.bg ? [{type: "SOLID", color: c.bg}] : [];
if (c.stroke) { btn.strokes = [{type: "SOLID", color: c.stroke}]; btn.strokeWeight = 1; }
btn.x = {{x|0}};
btn.y = {{y|0}};

const text = figma.createText();
text.fontName = {family: "Inter", style: "Medium"};
text.fontSize = fontSize;
text.characters = "{{text|Button}}";
text.fills = [{type: "SOLID", color: c.text}];
btn.appendChild(text);

const parentId = "{{parent|}}";
if (parentId) {
  const p = await figma.getNodeByIdAsync(parentId);
  if (p && "appendChild" in p) p.appendChild(btn);
}

figma.currentPage.selection = [btn];
return {id: btn.id, name: btn.name, w: btn.width, h: btn.height};
