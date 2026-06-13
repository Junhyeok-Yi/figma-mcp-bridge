// Template: Button — {{text}}
// Params: text, variant(primary|secondary|outline|ghost), size(sm|md|lg), parent, x, y

await figma.loadFontAsync({family: "Inter", style: "Semi Bold"});

const variant = "{{variant|primary}}";
const size = "{{size|md}}";

const sizing = {sm: {py: 8, px: 14, fs: 13}, md: {py: 10, px: 20, fs: 14}, lg: {py: 14, px: 28, fs: 16}};
const s = sizing[size] || sizing.md;

const styles = {
  primary:   {bg: {r:0.231,g:0.510,b:0.965}, text: {r:1,g:1,b:1}, stroke: null, radius: 10},
  secondary: {bg: {r:0.953,g:0.957,b:0.965}, text: {r:0.231,g:0.255,b:0.306}, stroke: null, radius: 10},
  outline:   {bg: null, text: {r:0.231,g:0.510,b:0.965}, stroke: {r:0.816,g:0.835,b:0.875}, radius: 10},
  ghost:     {bg: null, text: {r:0.231,g:0.510,b:0.965}, stroke: null, radius: 10},
};
const st = styles[variant] || styles.primary;

const btn = figma.createFrame();
btn.name = "{{text|Button}}";
btn.layoutMode = "HORIZONTAL";
btn.primaryAxisSizingMode = "AUTO";
btn.counterAxisSizingMode = "AUTO";
btn.primaryAxisAlignItems = "CENTER";
btn.counterAxisAlignItems = "CENTER";
btn.paddingTop = btn.paddingBottom = s.py;
btn.paddingLeft = btn.paddingRight = s.px;
btn.cornerRadius = st.radius;
btn.fills = st.bg ? [{type: "SOLID", color: st.bg}] : [];
if (st.stroke) { btn.strokes = [{type: "SOLID", color: st.stroke}]; btn.strokeWeight = 1.5; }
btn.x = {{x|0}};
btn.y = {{y|0}};

const text = figma.createText();
text.fontName = {family: "Inter", style: "Semi Bold"};
text.fontSize = s.fs;
text.lineHeight = {unit: "PIXELS", value: s.fs + 6};
text.characters = "{{text|Button}}";
text.fills = [{type: "SOLID", color: st.text}];
btn.appendChild(text);

const parentId = "{{parent|}}";
if (parentId) {
  const p = await figma.getNodeByIdAsync(parentId);
  if (p && "appendChild" in p) p.appendChild(btn);
}

figma.currentPage.selection = [btn];
return {id: btn.id, name: btn.name, w: btn.width, h: btn.height};
