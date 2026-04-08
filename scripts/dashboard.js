// Dashboard — 통계 카드 + 차트 영역 + 사이드바
// Usage: node figma-cli.js run scripts/dashboard.js

await figma.loadFontAsync({family: "Inter", style: "Bold"});
await figma.loadFontAsync({family: "Inter", style: "Semi Bold"});
await figma.loadFontAsync({family: "Inter", style: "Regular"});
await figma.loadFontAsync({family: "Inter", style: "Medium"});

const page = figma.createFrame();
page.name = "Dashboard";
page.resize(1200, 10);
page.layoutMode = "VERTICAL";
page.primaryAxisSizingMode = "AUTO";
page.counterAxisSizingMode = "FIXED";
page.paddingLeft = page.paddingRight = 32;
page.paddingTop = page.paddingBottom = 32;
page.itemSpacing = 24;
page.fills = [{type: "SOLID", color: {r: 0.965, g: 0.969, b: 0.976}}];

// ─── Header ───
const header = figma.createFrame();
header.name = "Header";
header.layoutMode = "HORIZONTAL";
header.primaryAxisSizingMode = "AUTO";
header.counterAxisSizingMode = "AUTO";
header.primaryAxisAlignItems = "SPACE_BETWEEN";
header.counterAxisAlignItems = "CENTER";
header.fills = [];
page.appendChild(header);
header.layoutSizingHorizontal = "FILL";

const title = figma.createText();
title.fontName = {family: "Inter", style: "Bold"};
title.fontSize = 24;
title.lineHeight = {unit: "PIXELS", value: 32};
title.characters = "Dashboard";
title.fills = [{type: "SOLID", color: {r: 0.067, g: 0.094, b: 0.153}}];
header.appendChild(title);

const headerRight = figma.createFrame();
headerRight.name = "Actions";
headerRight.layoutMode = "HORIZONTAL";
headerRight.primaryAxisSizingMode = "AUTO";
headerRight.counterAxisSizingMode = "AUTO";
headerRight.itemSpacing = 12;
headerRight.fills = [];

const searchBox = figma.createFrame();
searchBox.name = "Search";
searchBox.layoutMode = "HORIZONTAL";
searchBox.primaryAxisSizingMode = "AUTO";
searchBox.counterAxisSizingMode = "AUTO";
searchBox.counterAxisAlignItems = "CENTER";
searchBox.paddingLeft = searchBox.paddingRight = 14;
searchBox.paddingTop = searchBox.paddingBottom = 9;
searchBox.cornerRadius = 10;
searchBox.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
searchBox.strokes = [{type: "SOLID", color: {r: 0.886, g: 0.894, b: 0.910}}];
searchBox.strokeWeight = 1;
const searchText = figma.createText();
searchText.fontName = {family: "Inter", style: "Regular"};
searchText.fontSize = 14;
searchText.lineHeight = {unit: "PIXELS", value: 20};
searchText.characters = "Search...";
searchText.fills = [{type: "SOLID", color: {r: 0.631, g: 0.655, b: 0.698}}];
searchBox.appendChild(searchText);
searchBox.resize(200, searchBox.height);
headerRight.appendChild(searchBox);

const addBtn = figma.createFrame();
addBtn.name = "Add";
addBtn.layoutMode = "HORIZONTAL";
addBtn.primaryAxisSizingMode = "AUTO";
addBtn.counterAxisSizingMode = "AUTO";
addBtn.primaryAxisAlignItems = "CENTER";
addBtn.counterAxisAlignItems = "CENTER";
addBtn.paddingLeft = addBtn.paddingRight = 16;
addBtn.paddingTop = addBtn.paddingBottom = 9;
addBtn.cornerRadius = 10;
addBtn.fills = [{type: "SOLID", color: {r: 0.231, g: 0.510, b: 0.965}}];
const addText = figma.createText();
addText.fontName = {family: "Inter", style: "Semi Bold"};
addText.fontSize = 14;
addText.lineHeight = {unit: "PIXELS", value: 20};
addText.characters = "+ New Report";
addText.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
addBtn.appendChild(addText);
headerRight.appendChild(addBtn);
header.appendChild(headerRight);

// ─── Stats Row ───
const statsRow = figma.createFrame();
statsRow.name = "Stats";
statsRow.layoutMode = "HORIZONTAL";
statsRow.primaryAxisSizingMode = "AUTO";
statsRow.counterAxisSizingMode = "AUTO";
statsRow.itemSpacing = 16;
statsRow.fills = [];
page.appendChild(statsRow);
statsRow.layoutSizingHorizontal = "FILL";

const stats = [
  {label: "Total Users", value: "12,847", change: "+12.5%", up: true, icon: "\u25B2"},
  {label: "Revenue", value: "$48,295", change: "+8.2%", up: true, icon: "\u25B2"},
  {label: "Active Sessions", value: "1,423", change: "-3.1%", up: false, icon: "\u25BC"},
  {label: "Conversion Rate", value: "3.24%", change: "+0.8%", up: true, icon: "\u25B2"},
];

for (const s of stats) {
  const card = figma.createFrame();
  card.name = s.label;
  card.layoutMode = "VERTICAL";
  card.primaryAxisSizingMode = "AUTO";
  card.counterAxisSizingMode = "AUTO";
  card.paddingLeft = card.paddingRight = 20;
  card.paddingTop = card.paddingBottom = 18;
  card.itemSpacing = 10;
  card.cornerRadius = 14;
  card.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
  card.effects = [
    {type: "DROP_SHADOW", color: {r:0, g:0, b:0, a:0.03}, offset: {x:0, y:1}, radius: 2, spread: 0, visible: true, blendMode: "NORMAL"},
  ];

  const lbl = figma.createText();
  lbl.fontName = {family: "Inter", style: "Medium"};
  lbl.fontSize = 13;
  lbl.lineHeight = {unit: "PIXELS", value: 18};
  lbl.characters = s.label;
  lbl.fills = [{type: "SOLID", color: {r: 0.420, g: 0.447, b: 0.498}}];
  card.appendChild(lbl);

  const val = figma.createText();
  val.fontName = {family: "Inter", style: "Bold"};
  val.fontSize = 26;
  val.lineHeight = {unit: "PIXELS", value: 32};
  val.characters = s.value;
  val.fills = [{type: "SOLID", color: {r: 0.067, g: 0.094, b: 0.153}}];
  card.appendChild(val);

  const changeRow = figma.createFrame();
  changeRow.name = "Change";
  changeRow.layoutMode = "HORIZONTAL";
  changeRow.primaryAxisSizingMode = "AUTO";
  changeRow.counterAxisSizingMode = "AUTO";
  changeRow.counterAxisAlignItems = "CENTER";
  changeRow.itemSpacing = 4;
  changeRow.fills = [];

  const arrow = figma.createText();
  arrow.fontName = {family: "Inter", style: "Medium"};
  arrow.fontSize = 11;
  arrow.characters = s.icon;
  const changeColor = s.up ? {r: 0.063, g: 0.725, b: 0.506} : {r: 0.937, g: 0.267, b: 0.267};
  arrow.fills = [{type: "SOLID", color: changeColor}];
  changeRow.appendChild(arrow);

  const chg = figma.createText();
  chg.fontName = {family: "Inter", style: "Semi Bold"};
  chg.fontSize = 13;
  chg.lineHeight = {unit: "PIXELS", value: 18};
  chg.characters = s.change;
  chg.fills = [{type: "SOLID", color: changeColor}];
  changeRow.appendChild(chg);

  const period = figma.createText();
  period.fontName = {family: "Inter", style: "Regular"};
  period.fontSize = 13;
  period.lineHeight = {unit: "PIXELS", value: 18};
  period.characters = "vs last month";
  period.fills = [{type: "SOLID", color: {r: 0.631, g: 0.655, b: 0.698}}];
  changeRow.appendChild(period);

  card.appendChild(changeRow);
  statsRow.appendChild(card);
  card.layoutGrow = 1;
}

// ─── Content Area ───
const content = figma.createFrame();
content.name = "Content Area";
content.layoutMode = "HORIZONTAL";
content.primaryAxisSizingMode = "AUTO";
content.counterAxisSizingMode = "FIXED";
content.resize(1136, 420);
content.itemSpacing = 16;
content.fills = [];
page.appendChild(content);
content.layoutSizingHorizontal = "FILL";

// Main chart area
const mainArea = figma.createFrame();
mainArea.name = "Chart Area";
mainArea.resize(800, 10);
mainArea.layoutMode = "VERTICAL";
mainArea.primaryAxisSizingMode = "FIXED";
mainArea.counterAxisSizingMode = "FIXED";
mainArea.cornerRadius = 14;
mainArea.paddingLeft = mainArea.paddingRight = 24;
mainArea.paddingTop = mainArea.paddingBottom = 24;
mainArea.itemSpacing = 16;
mainArea.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
mainArea.effects = [
  {type: "DROP_SHADOW", color: {r:0, g:0, b:0, a:0.03}, offset: {x:0, y:1}, radius: 2, spread: 0, visible: true, blendMode: "NORMAL"},
];

const chartHeader = figma.createFrame();
chartHeader.name = "Chart Header";
chartHeader.layoutMode = "HORIZONTAL";
chartHeader.primaryAxisSizingMode = "AUTO";
chartHeader.counterAxisSizingMode = "AUTO";
chartHeader.primaryAxisAlignItems = "SPACE_BETWEEN";
chartHeader.counterAxisAlignItems = "CENTER";
chartHeader.fills = [];
const chartTitle = figma.createText();
chartTitle.fontName = {family: "Inter", style: "Semi Bold"};
chartTitle.fontSize = 16;
chartTitle.lineHeight = {unit: "PIXELS", value: 22};
chartTitle.characters = "Revenue Overview";
chartTitle.fills = [{type: "SOLID", color: {r: 0.067, g: 0.094, b: 0.153}}];
chartHeader.appendChild(chartTitle);

const periodBtn = figma.createFrame();
periodBtn.name = "Period";
periodBtn.layoutMode = "HORIZONTAL";
periodBtn.primaryAxisSizingMode = "AUTO";
periodBtn.counterAxisSizingMode = "AUTO";
periodBtn.paddingLeft = periodBtn.paddingRight = 12;
periodBtn.paddingTop = periodBtn.paddingBottom = 6;
periodBtn.cornerRadius = 8;
periodBtn.fills = [{type: "SOLID", color: {r: 0.953, g: 0.957, b: 0.965}}];
const periodText = figma.createText();
periodText.fontName = {family: "Inter", style: "Medium"};
periodText.fontSize = 13;
periodText.characters = "Last 30 days";
periodText.fills = [{type: "SOLID", color: {r: 0.380, g: 0.408, b: 0.459}}];
periodBtn.appendChild(periodText);
chartHeader.appendChild(periodBtn);

mainArea.appendChild(chartHeader);
chartHeader.layoutSizingHorizontal = "FILL";

const chartPlaceholder = figma.createFrame();
chartPlaceholder.name = "Chart";
chartPlaceholder.cornerRadius = 8;
chartPlaceholder.fills = [{type: "SOLID", color: {r: 0.973, g: 0.976, b: 0.980}}];
mainArea.appendChild(chartPlaceholder);
chartPlaceholder.layoutSizingHorizontal = "FILL";
chartPlaceholder.layoutGrow = 1;

content.appendChild(mainArea);
mainArea.layoutGrow = 1;
mainArea.layoutSizingVertical = "FILL";

// Sidebar — recent activity
const sidebar = figma.createFrame();
sidebar.name = "Recent Activity";
sidebar.resize(320, 10);
sidebar.layoutMode = "VERTICAL";
sidebar.primaryAxisSizingMode = "FIXED";
sidebar.counterAxisSizingMode = "FIXED";
sidebar.cornerRadius = 14;
sidebar.paddingLeft = sidebar.paddingRight = 20;
sidebar.paddingTop = sidebar.paddingBottom = 20;
sidebar.itemSpacing = 14;
sidebar.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
sidebar.effects = [
  {type: "DROP_SHADOW", color: {r:0, g:0, b:0, a:0.03}, offset: {x:0, y:1}, radius: 2, spread: 0, visible: true, blendMode: "NORMAL"},
];

const sideTitle = figma.createText();
sideTitle.fontName = {family: "Inter", style: "Semi Bold"};
sideTitle.fontSize = 16;
sideTitle.lineHeight = {unit: "PIXELS", value: 22};
sideTitle.characters = "Recent Activity";
sideTitle.fills = [{type: "SOLID", color: {r: 0.067, g: 0.094, b: 0.153}}];
sidebar.appendChild(sideTitle);
sideTitle.layoutSizingHorizontal = "FILL";

const activities = [
  {text: "New user registered", time: "2 min ago"},
  {text: "Payment received — $1,250", time: "15 min ago"},
  {text: "Report generated", time: "1 hr ago"},
  {text: "Server alert resolved", time: "3 hr ago"},
  {text: "Team member invited", time: "5 hr ago"},
];

for (let i = 0; i < activities.length; i++) {
  if (i > 0) {
    const div = figma.createRectangle();
    div.resize(100, 1);
    div.fills = [{type: "SOLID", color: {r: 0.945, g: 0.949, b: 0.957}}];
    sidebar.appendChild(div);
    div.layoutSizingHorizontal = "FILL";
  }

  const row = figma.createFrame();
  row.name = activities[i].text;
  row.layoutMode = "VERTICAL";
  row.primaryAxisSizingMode = "AUTO";
  row.counterAxisSizingMode = "AUTO";
  row.itemSpacing = 3;
  row.fills = [];

  const actText = figma.createText();
  actText.fontName = {family: "Inter", style: "Regular"};
  actText.fontSize = 14;
  actText.lineHeight = {unit: "PIXELS", value: 20};
  actText.characters = activities[i].text;
  actText.fills = [{type: "SOLID", color: {r: 0.133, g: 0.157, b: 0.208}}];
  row.appendChild(actText);
  actText.layoutSizingHorizontal = "FILL";

  const actTime = figma.createText();
  actTime.fontName = {family: "Inter", style: "Regular"};
  actTime.fontSize = 12;
  actTime.lineHeight = {unit: "PIXELS", value: 16};
  actTime.characters = activities[i].time;
  actTime.fills = [{type: "SOLID", color: {r: 0.631, g: 0.655, b: 0.698}}];
  row.appendChild(actTime);

  sidebar.appendChild(row);
  row.layoutSizingHorizontal = "FILL";
}

content.appendChild(sidebar);
sidebar.layoutSizingVertical = "FILL";

figma.currentPage.selection = [page];
figma.viewport.scrollAndZoomIntoView([page]);
return {id: page.id, w: page.width, h: page.height};
