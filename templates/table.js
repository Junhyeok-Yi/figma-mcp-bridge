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
table.layoutMode = "VERTICAL";
table.primaryAxisSizingMode = "AUTO";
table.counterAxisSizingMode = "FIXED";
table.resize(totalW, 10);
table.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
table.cornerRadius = 8;
table.strokes = [{type: "SOLID", color: {r: 0.898, g: 0.906, b: 0.922}}];
table.strokeWeight = 1;
table.clipsContent = true;
table.x = {{x|0}};
table.y = {{y|0}};

function createRow(cells, isHeader) {
  const row = figma.createFrame();
  row.name = isHeader ? "Header" : cells[0] || "Row";
  row.layoutMode = "HORIZONTAL";
  row.counterAxisAlignItems = "CENTER";
  row.paddingTop = row.paddingBottom = isHeader ? 12 : 10;
  row.fills = isHeader ? [{type: "SOLID", color: {r: 0.976, g: 0.980, b: 0.984}}] : [];

  for (let i = 0; i < headers.length; i++) {
    const cell = figma.createFrame();
    cell.name = headers[i];
    cell.layoutMode = "HORIZONTAL";
    cell.counterAxisAlignItems = "CENTER";
    cell.paddingLeft = cell.paddingRight = 16;
    cell.fills = [];
    cell.resize(colW, 10);
    cell.primaryAxisSizingMode = "FIXED";

    const t = figma.createText();
    t.fontName = {family: "Inter", style: isHeader ? "Semi Bold" : "Regular"};
    t.fontSize = 13;
    t.characters = (cells[i] || "").trim();
    t.fills = [{type: "SOLID", color: isHeader ? {r:0.067,g:0.094,b:0.153} : {r:0.420,g:0.447,b:0.498}}];
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
  div.fills = [{type: "SOLID", color: {r: 0.953, g: 0.957, b: 0.965}}];
  table.appendChild(div);
  div.layoutSizingHorizontal = "FILL";

  const row = createRow(cells, false);
  table.appendChild(row);
  row.layoutSizingHorizontal = "FILL";
}

figma.currentPage.selection = [table];
figma.viewport.scrollAndZoomIntoView([table]);
return {id: table.id, name: table.name, w: table.width, h: table.height, cols: headers.length, rows: rowData.length};
