// Template: CTA Button (Premium Pill) — {{text}}
// Params: text, variant(primary|dark|glass), size(md|lg), icon(true|false), parent, x, y

await figma.loadFontAsync({family: "Inter", style: "Semi Bold"});
await figma.loadFontAsync({family: "Inter", style: "Regular"});

const variant = "{{variant|primary}}";
const size = "{{size|lg}}";
const showIcon = "{{icon|true}}" === "true";

const sizing = {
  md: {py: 12, pxL: 24, pxR: showIcon ? 8 : 24, fs: 14, iconSize: 28},
  lg: {py: 16, pxL: 32, pxR: showIcon ? 12 : 32, fs: 16, iconSize: 32},
};
const s = sizing[size] || sizing.lg;

const styles = {
  primary: {
    bg: {r: 0.231, g: 0.510, b: 0.965},
    text: {r: 1, g: 1, b: 1},
    iconBg: {r: 0, g: 0, b: 0},
    iconBgOpacity: 0.15,
    iconColor: {r: 1, g: 1, b: 1},
    stroke: null,
  },
  dark: {
    bg: {r: 0.039, g: 0.039, b: 0.043},
    text: {r: 1, g: 1, b: 1},
    iconBg: {r: 1, g: 1, b: 1},
    iconBgOpacity: 0.15,
    iconColor: {r: 1, g: 1, b: 1},
    stroke: null,
  },
  glass: {
    bg: {r: 1, g: 1, b: 1},
    bgOpacity: 0.1,
    text: {r: 1, g: 1, b: 1},
    iconBg: {r: 1, g: 1, b: 1},
    iconBgOpacity: 0.15,
    iconColor: {r: 1, g: 1, b: 1},
    stroke: {r: 1, g: 1, b: 1},
    strokeOpacity: 0.2,
  },
};
const st = styles[variant] || styles.primary;

// Button container
const btn = figma.createFrame();
btn.name = "CTA / {{text|시작하기}}";
btn.layoutMode = "HORIZONTAL";
btn.primaryAxisSizingMode = "AUTO";
btn.counterAxisSizingMode = "AUTO";
btn.primaryAxisAlignItems = "CENTER";
btn.counterAxisAlignItems = "CENTER";
btn.paddingTop = btn.paddingBottom = s.py;
btn.paddingLeft = s.pxL;
btn.paddingRight = s.pxR;
btn.itemSpacing = 12;
btn.cornerRadius = 9999;
btn.fills = [{type: "SOLID", color: st.bg, opacity: st.bgOpacity || 1}];
if (st.stroke) {
  btn.strokes = [{type: "SOLID", color: st.stroke, opacity: st.strokeOpacity || 1}];
  btn.strokeWeight = 1;
}
if (variant === "glass") {
  btn.effects = [
    {type: "BACKGROUND_BLUR", radius: 24, visible: true},
  ];
}
btn.x = {{x|0}};
btn.y = {{y|0}};

// Label
const label = figma.createText();
label.fontName = {family: "Inter", style: "Semi Bold"};
label.fontSize = s.fs;
label.lineHeight = {unit: "PIXELS", value: s.fs + 6};
label.characters = "{{text|시작하기}}";
label.fills = [{type: "SOLID", color: st.text}];
btn.appendChild(label);

// Arrow icon circle
if (showIcon) {
  const iconWrap = figma.createFrame();
  iconWrap.name = "Icon";
  iconWrap.layoutMode = "HORIZONTAL";
  iconWrap.primaryAxisAlignItems = "CENTER";
  iconWrap.counterAxisAlignItems = "CENTER";
  iconWrap.resize(s.iconSize, s.iconSize);
  iconWrap.cornerRadius = 9999;
  iconWrap.fills = [{type: "SOLID", color: st.iconBg, opacity: st.iconBgOpacity}];

  const arrow = figma.createText();
  arrow.fontName = {family: "Inter", style: "Regular"};
  arrow.fontSize = s.iconSize * 0.5;
  arrow.characters = "→";
  arrow.fills = [{type: "SOLID", color: st.iconColor}];
  arrow.textAlignHorizontal = "CENTER";
  iconWrap.appendChild(arrow);
  btn.appendChild(iconWrap);
}

const parentId = "{{parent|}}";
if (parentId) {
  const p = await figma.getNodeByIdAsync(parentId);
  if (p && "appendChild" in p) p.appendChild(btn);
}

figma.currentPage.selection = [btn];
return {id: btn.id, name: btn.name, w: btn.width, h: btn.height};
