// Template: Table — data table with header and rows
// Params: cols (comma-separated headers), rows (semicolon-separated rows, comma-separated cells), w, x, y

await figma.loadFontAsync({family: "Inter", style: "Semi Bold"});
await figma.loadFontAsync({family: "Inter", style: "Regular"});

const headers = "{{cols|Name,Email,Role}}".split(",").map(s => s.trim());
const rowData = "{{rows|John Doe,john@example.com,Designer;Jane Smith,jane@example.com,Developer}}".split(";").map(r => r.split(",").map(s => s.trim()));
const totalW = {{w|640}};
const colW = Math.floor(totalW / headers.length);

const table = figma.createFrame();
table.name = "Table";
table.resize(totalW, 10);
table.layoutMode = "VERTICAL";
table.primaryAxisSizingMode = "AUTO";
table.counterAxisSizingMode = "FIXED";
table.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
table.cornerRadius = 12;
table.strokes = [{type: "SOLID", color: {r: 0.910, g: 0.918, b: 0.933}}];
table.strokeWeight = 1;
table.clipsContent = true;
table.x = {{x|0}};
table.y = {{y|0}};

function createRow(cells, isHeader) {
  const row = figma.createFrame();
  row.name = isHeader ? "Header" : (cells[0] || "Row");
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "AUTO";
  row.counterAxisSizingMode = "AUTO";
  row.counterAxisAlignItems = "CENTER";
  row.paddingTop = row.paddingBottom = isHeader ? 12 : 14;
  row.fills = isHeader ? [{type: "SOLID", color: {r: 0.973, g: 0.976, b: 0.980}}] : [];

  for (let i = 0; i < headers.length; i++) {
    const cell = figma.createFrame();
    cell.name = headers[i];
    cell.layoutMode = "HORIZONTAL";
    cell.primaryAxisSizingMode = "FIXED";
    cell.counterAxisSizingMode = "AUTO";
    cell.counterAxisAlignItems = "CENTER";
    cell.paddingLeft = cell.paddingRight = 16;
    cell.fills = [];
    cell.resize(colW, 10);

    const t = figma.createText();
    t.fontName = {family: "Inter", style: isHeader ? "Semi Bold" : "Regular"};
    t.fontSize = 14;
    t.lineHeight = {unit: "PIXELS", value: 20};
    t.characters = (cells[i] || "—").trim();
    t.fills = [{type: "SOLID", color: isHeader ? {r: 0.133, g: 0.157, b: 0.208} : {r: 0.380, g: 0.408, b: 0.459}}];
    cell.appendChild(t);
    t.layoutSizingHorizontal = "FILL";
    row.appendChild(cell);
  }
  return row;
}

const headerRow = createRow(headers, true);
table.appendChild(headerRow);
headerRow.layoutSizingHorizontal = "FILL";

for (const cells of rowData) {
  const div = figma.createRectangle();
  div.resize(100, 1);
  div.fills = [{type: "SOLID", color: {r: 0.945, g: 0.949, b: 0.957}}];
  table.appendChild(div);
  div.layoutSizingHorizontal = "FILL";

  const row = createRow(cells, false);
  table.appendChild(row);
  row.layoutSizingHorizontal = "FILL";
}

figma.currentPage.selection = [table];
figma.viewport.scrollAndZoomIntoView([table]);
return {id: table.id, name: table.name, w: table.width, h: table.height, cols: headers.length, rows: rowData.length};
