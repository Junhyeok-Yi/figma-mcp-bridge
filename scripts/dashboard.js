// Dashboard — 통계 카드 + 간단한 레이아웃
// Usage: node figma-cli.js run scripts/dashboard.js

await figma.loadFontAsync({family: "Inter", style: "Bold"});
await figma.loadFontAsync({family: "Inter", style: "Semi Bold"});
await figma.loadFontAsync({family: "Inter", style: "Regular"});
await figma.loadFontAsync({family: "Inter", style: "Medium"});

const page = figma.createFrame();
page.name = "Dashboard";
page.resize(1200, 800);
page.layoutMode = "VERTICAL";
page.primaryAxisSizingMode = "AUTO";
page.counterAxisSizingMode = "FIXED";
page.paddingLeft = page.paddingRight = 32;
page.paddingTop = page.paddingBottom = 32;
page.itemSpacing = 24;
page.fills = [{type: "SOLID", color: {r: 0.976, g: 0.980, b: 0.984}}];

// Header
const header = figma.createFrame();
header.name = "Header";
header.layoutMode = "HORIZONTAL";
header.primaryAxisAlignItems = "SPACE_BETWEEN";
header.counterAxisAlignItems = "CENTER";
header.fills = [];
page.appendChild(header);
header.layoutSizingHorizontal = "FILL";

const title = figma.createText();
title.fontName = {family: "Inter", style: "Bold"};
title.fontSize = 24;
title.characters = "Dashboard";
title.fills = [{type: "SOLID", color: {r: 0.067, g: 0.094, b: 0.153}}];
header.appendChild(title);

const headerRight = figma.createFrame();
headerRight.name = "Actions";
headerRight.layoutMode = "HORIZONTAL";
headerRight.itemSpacing = 12;
headerRight.fills = [];

const searchBox = figma.createFrame();
searchBox.name = "Search";
searchBox.layoutMode = "HORIZONTAL";
searchBox.counterAxisAlignItems = "CENTER";
searchBox.paddingLeft = searchBox.paddingRight = 12;
searchBox.paddingTop = searchBox.paddingBottom = 8;
searchBox.cornerRadius = 8;
searchBox.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
searchBox.strokes = [{type: "SOLID", color: {r: 0.898, g: 0.906, b: 0.922}}];
searchBox.strokeWeight = 1;
const searchText = figma.createText();
searchText.fontName = {family: "Inter", style: "Regular"};
searchText.fontSize = 14;
searchText.characters = "Search...";
searchText.fills = [{type: "SOLID", color: {r: 0.612, g: 0.639, b: 0.686}}];
searchBox.appendChild(searchText);
headerRight.appendChild(searchBox);
header.appendChild(headerRight);

// Stats Row
const statsRow = figma.createFrame();
statsRow.name = "Stats";
statsRow.layoutMode = "HORIZONTAL";
statsRow.primaryAxisSizingMode = "AUTO";
statsRow.itemSpacing = 16;
statsRow.fills = [];
page.appendChild(statsRow);
statsRow.layoutSizingHorizontal = "FILL";

const stats = [
  {label: "Total Users",   value: "12,847", change: "+12.5%", color: {r:0.063,g:0.725,b:0.506}},
  {label: "Revenue",       value: "$48,295", change: "+8.2%",  color: {r:0.063,g:0.725,b:0.506}},
  {label: "Active Sessions",value: "1,423",  change: "-3.1%",  color: {r:0.937,g:0.267,b:0.267}},
  {label: "Conversion Rate",value: "3.24%",  change: "+0.8%",  color: {r:0.063,g:0.725,b:0.506}},
];

for (const s of stats) {
  const card = figma.createFrame();
  card.name = s.label;
  card.layoutMode = "VERTICAL";
  card.primaryAxisSizingMode = "AUTO";
  card.counterAxisSizingMode = "AUTO";
  card.layoutGrow = 1;
  card.paddingLeft = card.paddingRight = card.paddingTop = card.paddingBottom = 20;
  card.itemSpacing = 8;
  card.cornerRadius = 12;
  card.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];

  const lbl = figma.createText();
  lbl.fontName = {family: "Inter", style: "Medium"};
  lbl.fontSize = 14;
  lbl.characters = s.label;
  lbl.fills = [{type: "SOLID", color: {r: 0.420, g: 0.447, b: 0.498}}];
  card.appendChild(lbl);

  const valRow = figma.createFrame();
  valRow.name = "Value";
  valRow.layoutMode = "HORIZONTAL";
  valRow.itemSpacing = 8;
  valRow.counterAxisAlignItems = "MAX";
  valRow.fills = [];

  const val = figma.createText();
  val.fontName = {family: "Inter", style: "Bold"};
  val.fontSize = 28;
  val.characters = s.value;
  val.fills = [{type: "SOLID", color: {r: 0.067, g: 0.094, b: 0.153}}];
  valRow.appendChild(val);

  const chg = figma.createText();
  chg.fontName = {family: "Inter", style: "Medium"};
  chg.fontSize = 14;
  chg.characters = s.change;
  chg.fills = [{type: "SOLID", color: s.color}];
  valRow.appendChild(chg);

  card.appendChild(valRow);
  statsRow.appendChild(card);
  card.layoutSizingHorizontal = "FILL";
}

// Content area placeholder
const content = figma.createFrame();
content.name = "Content Area";
content.layoutMode = "HORIZONTAL";
content.itemSpacing = 16;
content.fills = [];
page.appendChild(content);
content.layoutSizingHorizontal = "FILL";
content.layoutGrow = 1;

const mainArea = figma.createFrame();
mainArea.name = "Chart Area";
mainArea.resize(700, 400);
mainArea.layoutGrow = 1;
mainArea.cornerRadius = 12;
mainArea.paddingLeft = mainArea.paddingRight = mainArea.paddingTop = mainArea.paddingBottom = 24;
mainArea.layoutMode = "VERTICAL";
mainArea.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
const chartTitle = figma.createText();
chartTitle.fontName = {family: "Inter", style: "Semi Bold"};
chartTitle.fontSize = 16;
chartTitle.characters = "Revenue Overview";
chartTitle.fills = [{type: "SOLID", color: {r: 0.067, g: 0.094, b: 0.153}}];
mainArea.appendChild(chartTitle);
content.appendChild(mainArea);
mainArea.layoutSizingVertical = "FILL";

const sidebar = figma.createFrame();
sidebar.name = "Recent Activity";
sidebar.layoutGrow = 1;
sidebar.cornerRadius = 12;
sidebar.paddingLeft = sidebar.paddingRight = sidebar.paddingTop = sidebar.paddingBottom = 24;
sidebar.layoutMode = "VERTICAL";
sidebar.itemSpacing = 16;
sidebar.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
const sideTitle = figma.createText();
sideTitle.fontName = {family: "Inter", style: "Semi Bold"};
sideTitle.fontSize = 16;
sideTitle.characters = "Recent Activity";
sideTitle.fills = [{type: "SOLID", color: {r: 0.067, g: 0.094, b: 0.153}}];
sidebar.appendChild(sideTitle);
content.appendChild(sidebar);
sidebar.layoutSizingVertical = "FILL";

figma.currentPage.selection = [page];
figma.viewport.scrollAndZoomIntoView([page]);
return {id: page.id, w: page.width, h: page.height};
