// Template: List — vertical list of items
// Params: items (comma-separated), w, parent, x, y

await figma.loadFontAsync({family: "Inter", style: "Regular"});

const items = "{{items|Item 1,Item 2,Item 3}}".split(",").map(s => s.trim());

const list = figma.createFrame();
list.name = "List";
list.layoutMode = "VERTICAL";
list.primaryAxisSizingMode = "AUTO";
list.counterAxisSizingMode = "FIXED";
list.resize({{w|320}}, 10);
list.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
list.cornerRadius = 8;
list.strokes = [{type: "SOLID", color: {r: 0.898, g: 0.906, b: 0.922}}];
list.strokeWeight = 1;
list.clipsContent = true;
list.x = {{x|0}};
list.y = {{y|0}};

for (let i = 0; i < items.length; i++) {
  if (i > 0) {
    const div = figma.createRectangle();
    div.name = "Divider";
    div.resize(100, 1);
    div.fills = [{type: "SOLID", color: {r: 0.953, g: 0.957, b: 0.965}}];
    list.appendChild(div);
    div.layoutSizingHorizontal = "FILL";
  }

  const row = figma.createFrame();
  row.name = items[i];
  row.layoutMode = "HORIZONTAL";
  row.counterAxisAlignItems = "CENTER";
  row.paddingLeft = row.paddingRight = 16;
  row.paddingTop = row.paddingBottom = 12;
  row.fills = [];

  const text = figma.createText();
  text.fontName = {family: "Inter", style: "Regular"};
  text.fontSize = 14;
  text.characters = items[i];
  text.fills = [{type: "SOLID", color: {r: 0.067, g: 0.094, b: 0.153}}];
  row.appendChild(text);
  text.layoutSizingHorizontal = "FILL";

  list.appendChild(row);
  row.layoutSizingHorizontal = "FILL";
}

const parentId = "{{parent|}}";
if (parentId) {
  const p = await figma.getNodeByIdAsync(parentId);
  if (p && "appendChild" in p) { p.appendChild(list); list.layoutSizingHorizontal = "FILL"; }
}

figma.currentPage.selection = [list];
return {id: list.id, name: list.name, w: list.width, h: list.height, count: items.length};
