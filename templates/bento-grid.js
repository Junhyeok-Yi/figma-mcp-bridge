// Template: Bento Grid — {{title}}
// Params: title, cols(2|3), items(comma-separated titles), w, theme(light|dark), parent, x, y
// Generates an asymmetric bento grid layout with varying card sizes.

await figma.loadFontAsync({family: "Inter", style: "Bold"});
await figma.loadFontAsync({family: "Inter", style: "Semi Bold"});
await figma.loadFontAsync({family: "Inter", style: "Regular"});
await figma.loadFontAsync({family: "Inter", style: "Medium"});

const cols = parseInt("{{cols|3}}") || 3;
const theme = "{{theme|light}}";
const isDark = theme === "dark";
const totalW = parseInt("{{w|1200}}") || 1200;
const gap = 16;
const itemTitles = "{{items|Feature 1,Feature 2,Feature 3,Feature 4,Feature 5}}".split(",").map(s => s.trim());

const bg = isDark ? {r: 0.039, g: 0.039, b: 0.043} : {r: 0.969, g: 0.973, b: 0.976};
const cardBg = isDark ? {r: 0.078, g: 0.078, b: 0.086} : {r: 1, g: 1, b: 1};
const titleColor = isDark ? {r: 1, g: 1, b: 1} : {r: 0.067, g: 0.094, b: 0.153};
const descColor = isDark ? {r: 0.63, g: 0.63, b: 0.65} : {r: 0.38, g: 0.408, b: 0.459};
const ringColor = isDark ? {r: 1, g: 1, b: 1} : {r: 0, g: 0, b: 0};
const accentColor = {r: 0.231, g: 0.51, b: 0.965};

// 3-col bento pattern: [span2, span1] then [span1, span1, span1] alternating
// 2-col bento pattern: [span2] then [span1, span1] alternating
const patterns3 = [
  [{span: 2, h: 280}, {span: 1, h: 280}],
  [{span: 1, h: 240}, {span: 1, h: 240}, {span: 1, h: 240}],
  [{span: 1, h: 320}, {span: 2, h: 320}],
];
const patterns2 = [
  [{span: 2, h: 280}],
  [{span: 1, h: 260}, {span: 1, h: 260}],
];
const patterns = cols === 3 ? patterns3 : patterns2;

// Section wrapper
const section = figma.createFrame();
section.name = "Bento Grid / {{title|Features}}";
section.resize(totalW, 10);
section.layoutMode = "VERTICAL";
section.primaryAxisSizingMode = "AUTO";
section.counterAxisSizingMode = "FIXED";
section.paddingLeft = section.paddingRight = 0;
section.paddingTop = section.paddingBottom = 0;
section.itemSpacing = 0;
section.fills = [];
section.x = {{x|0}};
section.y = {{y|0}};

// Section title
const sectionTitle = "{{title|}}";
if (sectionTitle) {
  const headerFrame = figma.createFrame();
  headerFrame.name = "Header";
  headerFrame.layoutMode = "VERTICAL";
  headerFrame.primaryAxisSizingMode = "AUTO";
  headerFrame.counterAxisSizingMode = "FIXED";
  headerFrame.paddingBottom = 40;
  headerFrame.itemSpacing = 12;
  headerFrame.fills = [];

  // Eyebrow tag
  const eyebrow = figma.createFrame();
  eyebrow.name = "Eyebrow";
  eyebrow.layoutMode = "HORIZONTAL";
  eyebrow.primaryAxisSizingMode = "AUTO";
  eyebrow.counterAxisSizingMode = "AUTO";
  eyebrow.primaryAxisAlignItems = "CENTER";
  eyebrow.counterAxisAlignItems = "CENTER";
  eyebrow.paddingLeft = eyebrow.paddingRight = 12;
  eyebrow.paddingTop = eyebrow.paddingBottom = 4;
  eyebrow.cornerRadius = 9999;
  eyebrow.fills = [{type: "SOLID", color: accentColor, opacity: 0.1}];

  const eyebrowText = figma.createText();
  eyebrowText.fontName = {family: "Inter", style: "Medium"};
  eyebrowText.fontSize = 11;
  eyebrowText.letterSpacing = {unit: "PERCENT", value: 15};
  eyebrowText.characters = "FEATURES";
  eyebrowText.fills = [{type: "SOLID", color: accentColor}];
  eyebrow.appendChild(eyebrowText);
  headerFrame.appendChild(eyebrow);

  const heading = figma.createText();
  heading.fontName = {family: "Inter", style: "Bold"};
  heading.fontSize = 36;
  heading.lineHeight = {unit: "PIXELS", value: 44};
  heading.characters = sectionTitle;
  heading.fills = [{type: "SOLID", color: titleColor}];
  heading.textAutoResize = "HEIGHT";
  headerFrame.appendChild(heading);

  section.appendChild(headerFrame);
  headerFrame.layoutSizingHorizontal = "FILL";
  heading.layoutSizingHorizontal = "FILL";
}

// Build rows
let itemIdx = 0;
let rowIdx = 0;

while (itemIdx < itemTitles.length) {
  const pattern = patterns[rowIdx % patterns.length];
  const row = figma.createFrame();
  row.name = "Row " + (rowIdx + 1);
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "AUTO";
  row.itemSpacing = gap;
  row.fills = [];

  for (const slot of pattern) {
    if (itemIdx >= itemTitles.length) break;

    const slotW = slot.span === cols
      ? totalW
      : slot.span === 2
        ? Math.round((totalW - gap * (cols - 1)) * 2 / cols + gap)
        : Math.round((totalW - gap * (cols - 1)) / cols);

    const card = figma.createFrame();
    card.name = itemTitles[itemIdx];
    card.resize(slotW, slot.h);
    card.layoutMode = "VERTICAL";
    card.primaryAxisSizingMode = "FIXED";
    card.counterAxisSizingMode = "FIXED";
    card.primaryAxisAlignItems = "MAX";
    card.paddingLeft = card.paddingRight = 28;
    card.paddingTop = card.paddingBottom = 28;
    card.itemSpacing = 8;
    card.cornerRadius = 20;
    card.fills = [{type: "SOLID", color: cardBg}];
    card.strokes = [{type: "SOLID", color: ringColor, opacity: 0.06}];
    card.strokeWeight = 1;

    const cardTitle = figma.createText();
    cardTitle.fontName = {family: "Inter", style: "Semi Bold"};
    cardTitle.fontSize = 18;
    cardTitle.lineHeight = {unit: "PIXELS", value: 26};
    cardTitle.characters = itemTitles[itemIdx];
    cardTitle.fills = [{type: "SOLID", color: titleColor}];
    cardTitle.textAutoResize = "WIDTH_AND_HEIGHT";
    card.appendChild(cardTitle);

    const cardDesc = figma.createText();
    cardDesc.fontName = {family: "Inter", style: "Regular"};
    cardDesc.fontSize = 14;
    cardDesc.lineHeight = {unit: "PIXELS", value: 22};
    cardDesc.characters = "이 기능에 대한 설명이 여기에 들어갑니다.";
    cardDesc.fills = [{type: "SOLID", color: descColor}];
    cardDesc.textAutoResize = "HEIGHT";
    card.appendChild(cardDesc);
    cardDesc.layoutSizingHorizontal = "FILL";

    row.appendChild(card);
    itemIdx++;
  }

  section.appendChild(row);
  row.layoutSizingHorizontal = "FILL";
  rowIdx++;

  if (rowIdx > 10) break;
}

const parentId = "{{parent|}}";
if (parentId) {
  const p = await figma.getNodeByIdAsync(parentId);
  if (p && "appendChild" in p) { p.appendChild(section); section.layoutSizingHorizontal = "FILL"; }
}

figma.currentPage.selection = [section];
figma.viewport.scrollAndZoomIntoView([section]);
return {id: section.id, name: section.name, w: section.width, h: section.height};
