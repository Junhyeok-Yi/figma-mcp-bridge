// Template: Navbar — top navigation bar
// Params: title, items (comma-separated), w, x, y

await figma.loadFontAsync({family: "Inter", style: "Semi Bold"});
await figma.loadFontAsync({family: "Inter", style: "Medium"});

const menuItems = "{{items|Home,About,Contact}}".split(",").map(s => s.trim());

const nav = figma.createFrame();
nav.name = "Navbar";
nav.layoutMode = "HORIZONTAL";
nav.primaryAxisSizingMode = "FIXED";
nav.counterAxisSizingMode = "AUTO";
nav.primaryAxisAlignItems = "SPACE_BETWEEN";
nav.counterAxisAlignItems = "CENTER";
nav.resize({{w|1200}}, 10);
nav.paddingLeft = nav.paddingRight = 24;
nav.paddingTop = nav.paddingBottom = 16;
nav.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
nav.strokes = [{type: "SOLID", color: {r: 0.898, g: 0.906, b: 0.922}}];
nav.strokeWeight = 1;
nav.strokeAlign = "INSIDE";
nav.x = {{x|0}};
nav.y = {{y|0}};

const logo = figma.createText();
logo.name = "Logo";
logo.fontName = {family: "Inter", style: "Semi Bold"};
logo.fontSize = 18;
logo.characters = "{{title|Brand}}";
logo.fills = [{type: "SOLID", color: {r: 0.067, g: 0.094, b: 0.153}}];
nav.appendChild(logo);

const menu = figma.createFrame();
menu.name = "Menu";
menu.layoutMode = "HORIZONTAL";
menu.primaryAxisSizingMode = "AUTO";
menu.counterAxisSizingMode = "AUTO";
menu.itemSpacing = 32;
menu.fills = [];

for (const item of menuItems) {
  const link = figma.createText();
  link.fontName = {family: "Inter", style: "Medium"};
  link.fontSize = 14;
  link.characters = item;
  link.fills = [{type: "SOLID", color: {r: 0.420, g: 0.447, b: 0.498}}];
  menu.appendChild(link);
}

nav.appendChild(menu);

figma.currentPage.selection = [nav];
figma.viewport.scrollAndZoomIntoView([nav]);
return {id: nav.id, name: nav.name, w: nav.width, h: nav.height};
