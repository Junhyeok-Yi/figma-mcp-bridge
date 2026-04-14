// Redesign "Desktop - 8" memo board with auto-layout + mobile-ready structure
const ROOT_ID = "296:673";

const root = await figma.getNodeByIdAsync(ROOT_ID);
if (!root || root.type !== "FRAME") return { error: "Root frame not found" };

// ─── Fonts ───
await figma.loadFontAsync({ family: "Inter", style: "Bold" });
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
await figma.loadFontAsync({ family: "Inter", style: "Medium" });
await figma.loadFontAsync({ family: "Inter", style: "Regular" });

// ─── Collect existing children ───
const tabIds = ["296:762","296:764","296:766","296:768","296:770"];
const cardRows = [
  ["296:674","296:695","296:716","296:733"],
  ["296:681","296:702","296:719","296:740"],
  ["296:688","296:709","296:726","296:747"],
];
const overlayId = "296:754";

// Remove overlay frame (duplicate of a card position)
const overlay = await figma.getNodeByIdAsync(overlayId);
if (overlay) overlay.remove();

// ─── Colors ───
const bg      = { r: 0.976, g: 0.969, b: 0.957 };  // warm off-white #F9F7F4
const surface = { r: 1, g: 1, b: 1 };
const textPrimary   = { r: 0.067, g: 0.067, b: 0.067 };  // #111
const textSecondary = { r: 0.42, g: 0.42, b: 0.42 };     // #6B6B6B
const accent  = { r: 0.231, g: 0.51, b: 0.965 };         // #3B82F6

// ─── Helper: create text node ───
function createText(content, opts = {}) {
  const t = figma.createText();
  t.fontName = opts.font || { family: "Inter", style: "Regular" };
  t.fontSize = opts.size || 14;
  t.characters = content;
  t.fills = [{ type: "SOLID", color: opts.color || textPrimary }];
  if (opts.lineHeight) t.lineHeight = { unit: "PIXELS", value: opts.lineHeight };
  return t;
}

// ─── 1. Clear root & set up ───
// Remove old tabs
for (const id of tabIds) {
  const n = await figma.getNodeByIdAsync(id);
  if (n) n.remove();
}

// Detach all card groups temporarily
const allCards = [];
for (const row of cardRows) {
  for (const id of row) {
    const n = await figma.getNodeByIdAsync(id);
    if (n) allCards.push(n);
  }
}

// ─── 2. Build Header ───
const header = figma.createFrame();
header.name = "Header";
header.layoutMode = "HORIZONTAL";
header.counterAxisAlignItems = "CENTER";
header.primaryAxisSizingMode = "FIXED";
header.counterAxisSizingMode = "AUTO";
header.fills = [];
header.paddingLeft = 32; header.paddingRight = 32;
header.paddingTop = 24; header.paddingBottom = 24;

const titleText = createText("Memos", { font: { family: "Inter", style: "Bold" }, size: 28, lineHeight: 36 });
header.appendChild(titleText);

// Spacer
const spacer = figma.createFrame();
spacer.name = "spacer";
spacer.fills = [];
spacer.layoutGrow = 1;
spacer.resize(10, 1);
header.appendChild(spacer);

// Search icon placeholder
const searchBtn = figma.createFrame();
searchBtn.name = "Search";
searchBtn.resize(40, 40);
searchBtn.cornerRadius = 12;
searchBtn.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.95, b: 0.95 } }];
searchBtn.layoutMode = "HORIZONTAL";
searchBtn.primaryAxisAlignItems = "CENTER";
searchBtn.counterAxisAlignItems = "CENTER";
const searchIcon = createText("🔍", { size: 18 });
searchBtn.appendChild(searchIcon);
header.appendChild(searchBtn);

// ─── 3. Build Tab Bar ───
const tabBar = figma.createFrame();
tabBar.name = "Tab Bar";
tabBar.layoutMode = "HORIZONTAL";
tabBar.primaryAxisSizingMode = "FIXED";
tabBar.counterAxisSizingMode = "AUTO";
tabBar.itemSpacing = 8;
tabBar.paddingLeft = 32; tabBar.paddingRight = 32;
tabBar.paddingTop = 0; tabBar.paddingBottom = 16;
tabBar.fills = [];

const tabLabels = ["전체", "AI Fitness", "상무님 보고", "디자인 업데이트"];
tabLabels.forEach((label, i) => {
  const tab = figma.createFrame();
  tab.name = `Tab/${label}`;
  tab.layoutMode = "HORIZONTAL";
  tab.primaryAxisAlignItems = "CENTER";
  tab.counterAxisAlignItems = "CENTER";
  tab.primaryAxisSizingMode = "AUTO";
  tab.counterAxisSizingMode = "AUTO";
  tab.paddingLeft = 16; tab.paddingRight = 16;
  tab.paddingTop = 8; tab.paddingBottom = 8;
  tab.cornerRadius = 20;

  if (i === 0) {
    tab.fills = [{ type: "SOLID", color: textPrimary }];
    const txt = createText(label, { font: { family: "Inter", style: "Medium" }, size: 14, color: surface });
    tab.appendChild(txt);
  } else {
    tab.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.95, b: 0.95 } }];
    const txt = createText(label, { font: { family: "Inter", style: "Medium" }, size: 14, color: textSecondary });
    tab.appendChild(txt);
  }
  tabBar.appendChild(tab);
});

// Spacer in tab bar
const tabSpacer = figma.createFrame();
tabSpacer.name = "spacer";
tabSpacer.fills = [];
tabSpacer.layoutGrow = 1;
tabSpacer.resize(10, 1);
tabBar.appendChild(tabSpacer);

// Sort button
const sortBtn = figma.createFrame();
sortBtn.name = "Sort";
sortBtn.layoutMode = "HORIZONTAL";
sortBtn.primaryAxisAlignItems = "CENTER";
sortBtn.counterAxisAlignItems = "CENTER";
sortBtn.primaryAxisSizingMode = "AUTO";
sortBtn.counterAxisSizingMode = "AUTO";
sortBtn.paddingLeft = 12; sortBtn.paddingRight = 12;
sortBtn.paddingTop = 8; sortBtn.paddingBottom = 8;
sortBtn.cornerRadius = 8;
sortBtn.fills = [];
sortBtn.strokes = [{ type: "SOLID", color: { r: 0.898, g: 0.898, b: 0.898 } }];
sortBtn.strokeWeight = 1;
const sortText = createText("시간순 ↓", { font: { family: "Inter", style: "Medium" }, size: 13, color: textSecondary });
sortBtn.appendChild(sortText);
tabBar.appendChild(sortBtn);

// ─── 4. Build Card Grid ───
const grid = figma.createFrame();
grid.name = "Card Grid";
grid.layoutMode = "VERTICAL";
grid.primaryAxisSizingMode = "AUTO";
grid.counterAxisSizingMode = "FIXED";
grid.itemSpacing = 20;
grid.paddingLeft = 32; grid.paddingRight = 32;
grid.paddingTop = 8; grid.paddingBottom = 32;
grid.fills = [];

for (let r = 0; r < cardRows.length; r++) {
  const row = figma.createFrame();
  row.name = `Row ${r + 1}`;
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "AUTO";
  row.itemSpacing = 20;
  row.fills = [];

  for (const cardId of cardRows[r]) {
    const card = await figma.getNodeByIdAsync(cardId);
    if (!card) continue;

    // Wrap GROUP in a frame for auto-layout compatibility
    const wrapper = figma.createFrame();
    wrapper.name = card.name.replace("Mask group", `Card ${allCards.indexOf(card) + 1}`);
    wrapper.layoutMode = "VERTICAL";
    wrapper.primaryAxisSizingMode = "FIXED";
    wrapper.counterAxisSizingMode = "FIXED";
    wrapper.resize(335, 335);
    wrapper.cornerRadius = 20;
    wrapper.clipsContent = true;
    wrapper.fills = [];
    wrapper.layoutGrow = 1;

    // Move the group into wrapper
    wrapper.appendChild(card);
    card.x = 0;
    card.y = 0;

    row.appendChild(wrapper);
  }

  grid.appendChild(row);
}

// ─── 5. Assemble root ───
// Remove any remaining children from root
while (root.children.length > 0) {
  root.children[0].remove();
}

root.layoutMode = "VERTICAL";
root.primaryAxisSizingMode = "AUTO";
root.counterAxisSizingMode = "FIXED";
root.resize(1440, 10);
root.fills = [{ type: "SOLID", color: bg }];
root.clipsContent = true;
root.name = "Memo Board / Desktop";

root.appendChild(header);
root.appendChild(tabBar);
root.appendChild(grid);

// Make header and tab bar fill width
header.layoutSizingHorizontal = "FILL";
tabBar.layoutSizingHorizontal = "FILL";
grid.layoutSizingHorizontal = "FILL";

// Make grid rows fill width
for (const child of grid.children) {
  if (child.type === "FRAME") {
    child.layoutSizingHorizontal = "FILL";
  }
}

return {
  success: true,
  rootId: ROOT_ID,
  structure: "Header + Tab Bar + 3×4 Card Grid",
  autoLayout: "VERTICAL",
  width: 1440,
};
