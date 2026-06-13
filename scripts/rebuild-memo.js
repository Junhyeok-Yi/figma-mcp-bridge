// Rebuild Memo Board — full recreation with auto-layout
const ROOT_ID = "296:673";
const root = await figma.getNodeByIdAsync(ROOT_ID);
if (!root || root.type !== "FRAME") return { error: "Root not found" };

await figma.loadFontAsync({ family: "Inter", style: "Bold" });
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
await figma.loadFontAsync({ family: "Inter", style: "Medium" });
await figma.loadFontAsync({ family: "Inter", style: "Regular" });

// ─── Nuke everything ───
while (root.children.length > 0) root.children[0].remove();

// ─── Colors ───
const bg       = { r: 0.973, g: 0.965, b: 0.953 };
const surface  = { r: 1, g: 1, b: 1 };
const dark     = { r: 0.08, g: 0.08, b: 0.08 };
const gray500  = { r: 0.42, g: 0.42, b: 0.42 };
const gray200  = { r: 0.90, g: 0.90, b: 0.90 };
const gray100  = { r: 0.95, g: 0.95, b: 0.95 };

const cardPalette = [
  { from: { r:0.996,g:0.941,b:0.541 }, to: { r:0.870,g:0.812,b:0.385 } },
  { from: { r:0.678,g:0.847,b:0.902 }, to: { r:0.529,g:0.733,b:0.804 } },
  { from: { r:0.910,g:0.765,b:0.965 }, to: { r:0.780,g:0.600,b:0.860 } },
  { from: { r:0.988,g:0.733,b:0.631 }, to: { r:0.910,g:0.588,b:0.478 } },
  { from: { r:0.702,g:0.933,b:0.792 }, to: { r:0.545,g:0.820,b:0.665 } },
  { from: { r:0.996,g:0.851,b:0.557 }, to: { r:0.910,g:0.745,b:0.420 } },
];

const memoData = [
  { date: "Aug 26", title: "컨셉 디자인 과제원 공유", tag: "디자인 업데이트" },
  { date: "Aug 26", title: "단어 10개 외우기 내일까지", tag: "AI Fitness" },
  { date: "Aug 25", title: "Explore Next 2.0 상무님 보고 일정 잡기", tag: "상무님 보고" },
  { date: "Aug 25", title: "디자인 시스템 v2 컴포넌트 정리", tag: "디자인 업데이트" },
  { date: "Aug 24", title: "주간 스프린트 리뷰 메모", tag: "상무님 보고" },
  { date: "Aug 24", title: "AI 모델 벤치마크 결과 정리", tag: "AI Fitness" },
  { date: "Aug 23", title: "신규 온보딩 플로우 와이어프레임", tag: "디자인 업데이트" },
  { date: "Aug 23", title: "운동 루틴 3주차 기록", tag: "AI Fitness" },
  { date: "Aug 22", title: "Q3 KPI 대시보드 디자인", tag: "상무님 보고" },
  { date: "Aug 22", title: "디자인 토큰 Figma Variables 등록", tag: "디자인 업데이트" },
  { date: "Aug 21", title: "프론트엔드 핸드오프 체크리스트", tag: "상무님 보고" },
  { date: "Aug 21", title: "독서 메모: Atomic Habits Ch.7", tag: "AI Fitness" },
];

function mkText(content, opts = {}) {
  const t = figma.createText();
  t.fontName = opts.font || { family: "Inter", style: "Regular" };
  t.fontSize = opts.size || 14;
  t.characters = content;
  t.fills = [{ type: "SOLID", color: opts.color || dark }];
  if (opts.lh) t.lineHeight = { unit: "PIXELS", value: opts.lh };
  if (opts.resize) t.textAutoResize = opts.resize;
  return t;
}

function mkCard(data, index) {
  const pal = cardPalette[index % cardPalette.length];
  const card = figma.createFrame();
  card.name = `Card / ${data.title.slice(0, 20)}`;
  card.layoutMode = "VERTICAL";
  card.primaryAxisSizingMode = "FIXED";
  card.counterAxisSizingMode = "FIXED";
  card.resize(100, 320);
  card.layoutGrow = 1;
  card.cornerRadius = 20;
  card.clipsContent = true;
  card.paddingLeft = 24; card.paddingRight = 24;
  card.paddingTop = 24; card.paddingBottom = 24;
  card.itemSpacing = 12;
  card.fills = [{
    type: "GRADIENT_LINEAR",
    gradientStops: [
      { color: { ...pal.from, a: 1 }, position: 0 },
      { color: { ...pal.to, a: 1 }, position: 1 },
    ],
    gradientTransform: [[0, 1, 0], [-1, 0, 1]],
  }];
  card.strokes = [{
    type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.4,
  }];
  card.strokeWeight = 1.5;
  card.effects = [
    { type: "DROP_SHADOW", color: { r:0,g:0,b:0,a:0.08 }, offset: {x:0,y:4}, radius: 12, spread: -2, visible: true, blendMode: "NORMAL" },
  ];

  // Tag pill
  const pill = figma.createFrame();
  pill.name = "Tag";
  pill.layoutMode = "HORIZONTAL";
  pill.primaryAxisSizingMode = "AUTO";
  pill.counterAxisSizingMode = "AUTO";
  pill.primaryAxisAlignItems = "CENTER";
  pill.counterAxisAlignItems = "CENTER";
  pill.paddingLeft = 10; pill.paddingRight = 10;
  pill.paddingTop = 4; pill.paddingBottom = 4;
  pill.cornerRadius = 12;
  pill.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.12 }];
  const tagText = mkText(data.tag, { size: 11, font: { family: "Inter", style: "Medium" }, color: { r: 0.15, g: 0.15, b: 0.15 } });
  pill.appendChild(tagText);
  card.appendChild(pill);

  // Date
  const dateText = mkText(data.date, { size: 12, font: { family: "Inter", style: "Medium" }, color: { r: 0.25, g: 0.25, b: 0.25 } });
  card.appendChild(dateText);

  // Spacer
  const sp = figma.createFrame();
  sp.name = "spacer";
  sp.fills = [];
  sp.layoutGrow = 1;
  sp.resize(10, 10);
  card.appendChild(sp);

  // Title
  const title = mkText(data.title, {
    size: 18, font: { family: "Inter", style: "Semi Bold" },
    lh: 26, color: dark, resize: "HEIGHT",
  });
  card.appendChild(title);
  title.layoutSizingHorizontal = "FILL";

  // Memo indicator
  const memo = figma.createFrame();
  memo.name = "Memo indicator";
  memo.layoutMode = "HORIZONTAL";
  memo.primaryAxisSizingMode = "AUTO";
  memo.counterAxisSizingMode = "AUTO";
  memo.counterAxisAlignItems = "CENTER";
  memo.itemSpacing = 6;
  memo.fills = [];
  const dot = figma.createEllipse();
  dot.resize(6, 6);
  dot.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 }, opacity: 0.5 }];
  memo.appendChild(dot);
  const memoLabel = mkText("Memo", { size: 12, font: { family: "Inter", style: "Regular" }, color: gray500 });
  memo.appendChild(memoLabel);
  card.appendChild(memo);

  return card;
}

// ─── Root setup ───
root.name = "Memo Board / Desktop";
root.layoutMode = "VERTICAL";
root.primaryAxisSizingMode = "AUTO";
root.counterAxisSizingMode = "FIXED";
root.resize(1440, 10);
root.fills = [{ type: "SOLID", color: bg }];
root.clipsContent = true;

// ─── Header ───
const header = figma.createFrame();
header.name = "Header";
header.layoutMode = "HORIZONTAL";
header.counterAxisAlignItems = "CENTER";
header.primaryAxisSizingMode = "FIXED";
header.counterAxisSizingMode = "AUTO";
header.paddingLeft = 40; header.paddingRight = 40;
header.paddingTop = 32; header.paddingBottom = 16;
header.fills = [];
const titleNode = mkText("Memos", { size: 32, font: { family: "Inter", style: "Bold" }, lh: 40 });
header.appendChild(titleNode);

const hSpacer = figma.createFrame();
hSpacer.name = "spacer"; hSpacer.fills = []; hSpacer.layoutGrow = 1; hSpacer.resize(10,1);
header.appendChild(hSpacer);

const searchBtn = figma.createFrame();
searchBtn.name = "Search";
searchBtn.resize(44, 44);
searchBtn.cornerRadius = 14;
searchBtn.fills = [{ type: "SOLID", color: surface }];
searchBtn.effects = [{ type: "DROP_SHADOW", color:{r:0,g:0,b:0,a:0.06}, offset:{x:0,y:2}, radius:8, spread:0, visible:true, blendMode:"NORMAL" }];
searchBtn.layoutMode = "HORIZONTAL";
searchBtn.primaryAxisAlignItems = "CENTER";
searchBtn.counterAxisAlignItems = "CENTER";
const sIcon = mkText("🔍", { size: 18 });
searchBtn.appendChild(sIcon);
header.appendChild(searchBtn);

root.appendChild(header);
header.layoutSizingHorizontal = "FILL";

// ─── Tab Bar ───
const tabBar = figma.createFrame();
tabBar.name = "Tab Bar";
tabBar.layoutMode = "HORIZONTAL";
tabBar.primaryAxisSizingMode = "FIXED";
tabBar.counterAxisSizingMode = "AUTO";
tabBar.counterAxisAlignItems = "CENTER";
tabBar.itemSpacing = 8;
tabBar.paddingLeft = 40; tabBar.paddingRight = 40;
tabBar.paddingTop = 8; tabBar.paddingBottom = 20;
tabBar.fills = [];
["전체", "AI Fitness", "상무님 보고", "디자인 업데이트"].forEach((label, i) => {
  const tab = figma.createFrame();
  tab.name = `Tab/${label}`;
  tab.layoutMode = "HORIZONTAL";
  tab.primaryAxisAlignItems = "CENTER";
  tab.counterAxisAlignItems = "CENTER";
  tab.primaryAxisSizingMode = "AUTO";
  tab.counterAxisSizingMode = "AUTO";
  tab.paddingLeft = 18; tab.paddingRight = 18;
  tab.paddingTop = 10; tab.paddingBottom = 10;
  tab.cornerRadius = 24;

  if (i === 0) {
    tab.fills = [{ type: "SOLID", color: dark }];
    tab.appendChild(mkText(label, { size: 14, font: { family: "Inter", style: "Semi Bold" }, color: surface }));
  } else {
    tab.fills = [{ type: "SOLID", color: surface }];
    tab.effects = [{ type: "DROP_SHADOW", color:{r:0,g:0,b:0,a:0.05}, offset:{x:0,y:1}, radius:4, spread:0, visible:true, blendMode:"NORMAL" }];
    tab.appendChild(mkText(label, { size: 14, font: { family: "Inter", style: "Medium" }, color: gray500 }));
  }
  tabBar.appendChild(tab);
});

const tSpacer = figma.createFrame();
tSpacer.name = "spacer"; tSpacer.fills = []; tSpacer.layoutGrow = 1; tSpacer.resize(10,1);
tabBar.appendChild(tSpacer);

const sortBtn = figma.createFrame();
sortBtn.name = "Sort";
sortBtn.layoutMode = "HORIZONTAL";
sortBtn.primaryAxisAlignItems = "CENTER";
sortBtn.counterAxisAlignItems = "CENTER";
sortBtn.primaryAxisSizingMode = "AUTO";
sortBtn.counterAxisSizingMode = "AUTO";
sortBtn.paddingLeft = 14; sortBtn.paddingRight = 14;
sortBtn.paddingTop = 10; sortBtn.paddingBottom = 10;
sortBtn.cornerRadius = 12;
sortBtn.fills = [{ type: "SOLID", color: surface }];
sortBtn.effects = [{ type: "DROP_SHADOW", color:{r:0,g:0,b:0,a:0.05}, offset:{x:0,y:1}, radius:4, spread:0, visible:true, blendMode:"NORMAL" }];
sortBtn.appendChild(mkText("시간순 ↓", { size: 13, font: { family: "Inter", style: "Medium" }, color: gray500 }));
tabBar.appendChild(sortBtn);

root.appendChild(tabBar);
tabBar.layoutSizingHorizontal = "FILL";

// ─── Card Grid ───
const grid = figma.createFrame();
grid.name = "Card Grid";
grid.layoutMode = "VERTICAL";
grid.primaryAxisSizingMode = "AUTO";
grid.counterAxisSizingMode = "FIXED";
grid.itemSpacing = 20;
grid.paddingLeft = 40; grid.paddingRight = 40;
grid.paddingTop = 0; grid.paddingBottom = 40;
grid.fills = [];
for (let r = 0; r < 3; r++) {
  const row = figma.createFrame();
  row.name = `Row ${r + 1}`;
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "AUTO";
  row.itemSpacing = 20;
  row.fills = [];
  for (let c = 0; c < 4; c++) {
    const idx = r * 4 + c;
    const card = mkCard(memoData[idx], idx);
    row.appendChild(card);
  }
  grid.appendChild(row);
}

root.appendChild(grid);
grid.layoutSizingHorizontal = "FILL";

// Set row FILL after attached to grid
for (const row of grid.children) {
  if (row.type === "FRAME") row.layoutSizingHorizontal = "FILL";
}

return {
  success: true,
  rootId: ROOT_ID,
  name: root.name,
  w: Math.round(root.width),
  h: Math.round(root.height),
  cards: 12,
};
