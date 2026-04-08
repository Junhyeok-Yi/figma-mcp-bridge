// Template: List — vertical list of items
// Params: items (comma-separated), w, parent, x, y

await figma.loadFontAsync({family: "Inter", style: "Regular"});

const items = "{{items|Item 1,Item 2,Item 3}}".split(",").map(s => s.trim());

const list = figma.createFrame();
list.name = "List";
list.resize({{w|320}}, 10);
list.layoutMode = "VERTICAL";
list.primaryAxisSizingMode = "AUTO";
list.counterAxisSizingMode = "FIXED";
list.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
list.cornerRadius = 12;
list.strokes = [{type: "SOLID", color: {r: 0.910, g: 0.918, b: 0.933}}];
list.strokeWeight = 1;
list.clipsContent = true;
list.x = {{x|0}};
list.y = {{y|0}};

for (let i = 0; i < items.length; i++) {
  if (i > 0) {
    const div = figma.createRectangle();
    div.name = "Divider";
    div.resize(100, 1);
    div.fills = [{type: "SOLID", color: {r: 0.945, g: 0.949, b: 0.957}}];
    list.appendChild(div);
    div.layoutSizingHorizontal = "FILL";
  }

  const row = figma.createFrame();
  row.name = items[i];
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "AUTO";
  row.counterAxisSizingMode = "AUTO";
  row.counterAxisAlignItems = "CENTER";
  row.paddingLeft = row.paddingRight = 16;
  row.paddingTop = row.paddingBottom = 14;
  row.fills = [];

  const text = figma.createText();
  text.fontName = {family: "Inter", style: "Regular"};
  text.fontSize = 15;
  text.lineHeight = {unit: "PIXELS", value: 22};
  text.characters = items[i];
  text.fills = [{type: "SOLID", color: {r: 0.133, g: 0.157, b: 0.208}}];
  row.appendChild(text);
  text.layoutSizingHorizontal = "FILL";

  const chevron = figma.createText();
  chevron.fontName = {family: "Inter", style: "Regular"};
  chevron.fontSize = 14;
  chevron.characters = "›";
  chevron.fills = [{type: "SOLID", color: {r: 0.631, g: 0.655, b: 0.698}}];
  row.appendChild(chevron);

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
