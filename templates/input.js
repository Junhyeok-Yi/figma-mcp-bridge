// Template: Input Field — {{label}}
// Params: label, placeholder, w, parent, x, y

await figma.loadFontAsync({family: "Inter", style: "Medium"});
await figma.loadFontAsync({family: "Inter", style: "Regular"});

const wrapper = figma.createFrame();
wrapper.name = "{{label|Label}}";
wrapper.layoutMode = "VERTICAL";
wrapper.primaryAxisSizingMode = "AUTO";
wrapper.counterAxisSizingMode = "FIXED";
wrapper.resize({{w|320}}, 10);
wrapper.itemSpacing = 6;
wrapper.fills = [];
wrapper.x = {{x|0}};
wrapper.y = {{y|0}};

const label = figma.createText();
label.fontName = {family: "Inter", style: "Medium"};
label.fontSize = 14;
label.characters = "{{label|Label}}";
label.fills = [{type: "SOLID", color: {r: 0.067, g: 0.094, b: 0.153}}];
wrapper.appendChild(label);
label.layoutSizingHorizontal = "FILL";

const field = figma.createFrame();
field.name = "Input";
field.layoutMode = "HORIZONTAL";
field.counterAxisAlignItems = "CENTER";
field.paddingLeft = field.paddingRight = 12;
field.paddingTop = field.paddingBottom = 10;
field.cornerRadius = 8;
field.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
field.strokes = [{type: "SOLID", color: {r: 0.898, g: 0.906, b: 0.922}}];
field.strokeWeight = 1;

const placeholder = figma.createText();
placeholder.fontName = {family: "Inter", style: "Regular"};
placeholder.fontSize = 14;
placeholder.characters = "{{placeholder|Enter value...}}";
placeholder.fills = [{type: "SOLID", color: {r: 0.612, g: 0.639, b: 0.686}}];
field.appendChild(placeholder);
placeholder.layoutSizingHorizontal = "FILL";

wrapper.appendChild(field);
field.layoutSizingHorizontal = "FILL";

const parentId = "{{parent|}}";
if (parentId) {
  const p = await figma.getNodeByIdAsync(parentId);
  if (p && "appendChild" in p) { p.appendChild(wrapper); wrapper.layoutSizingHorizontal = "FILL"; }
}

figma.currentPage.selection = [wrapper];
return {id: wrapper.id, name: wrapper.name, w: wrapper.width, h: wrapper.height};
