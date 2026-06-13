// Template: Navbar — top navigation bar
// Params: title, items (comma-separated), w, x, y

await figma.loadFontAsync({family: "Inter", style: "Bold"});
await figma.loadFontAsync({family: "Inter", style: "Medium"});

const menuItems = "{{items|Home,About,Contact}}".split(",").map(s => s.trim());

const nav = figma.createFrame();
nav.name = "Navbar";
nav.resize({{w|1200}}, 10);
nav.layoutMode = "HORIZONTAL";
nav.primaryAxisSizingMode = "FIXED";
nav.counterAxisSizingMode = "AUTO";
nav.primaryAxisAlignItems = "SPACE_BETWEEN";
nav.counterAxisAlignItems = "CENTER";
nav.paddingLeft = nav.paddingRight = 24;
nav.paddingTop = nav.paddingBottom = 14;
nav.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
nav.effects = [
  {type: "DROP_SHADOW", color: {r:0, g:0, b:0, a:0.05}, offset: {x:0, y:1}, radius: 3, spread: 0, visible: true, blendMode: "NORMAL"},
];
nav.x = {{x|0}};
nav.y = {{y|0}};

const logo = figma.createText();
logo.name = "Logo";
logo.fontName = {family: "Inter", style: "Bold"};
logo.fontSize = 18;
logo.lineHeight = {unit: "PIXELS", value: 24};
logo.characters = "{{title|Brand}}";
logo.fills = [{type: "SOLID", color: {r: 0.067, g: 0.094, b: 0.153}}];
nav.appendChild(logo);

const menu = figma.createFrame();
menu.name = "Menu";
menu.layoutMode = "HORIZONTAL";
menu.primaryAxisSizingMode = "AUTO";
menu.counterAxisSizingMode = "AUTO";
menu.itemSpacing = 32;
menu.counterAxisAlignItems = "CENTER";
menu.fills = [];

for (let i = 0; i < menuItems.length; i++) {
  const link = figma.createText();
  link.fontName = {family: "Inter", style: "Medium"};
  link.fontSize = 14;
  link.lineHeight = {unit: "PIXELS", value: 20};
  link.characters = menuItems[i];
  link.fills = [{type: "SOLID", color: i === 0 ? {r: 0.231, g: 0.510, b: 0.965} : {r: 0.380, g: 0.408, b: 0.459}}];
  menu.appendChild(link);
}

nav.appendChild(menu);

figma.currentPage.selection = [nav];
figma.viewport.scrollAndZoomIntoView([nav]);
return {id: nav.id, name: nav.name, w: nav.width, h: nav.height};
