// Template: Input Field — {{label}}
// Params: label, placeholder, w, parent, x, y

await figma.loadFontAsync({family: "Inter", style: "Medium"});
await figma.loadFontAsync({family: "Inter", style: "Regular"});

const wrapper = figma.createFrame();
wrapper.name = "{{label|Label}}";
wrapper.resize({{w|320}}, 10);
wrapper.layoutMode = "VERTICAL";
wrapper.primaryAxisSizingMode = "AUTO";
wrapper.counterAxisSizingMode = "FIXED";
wrapper.itemSpacing = 6;
wrapper.fills = [];
wrapper.x = {{x|0}};
wrapper.y = {{y|0}};

const label = figma.createText();
label.fontName = {family: "Inter", style: "Medium"};
label.fontSize = 14;
label.lineHeight = {unit: "PIXELS", value: 20};
label.characters = "{{label|Label}}";
label.fills = [{type: "SOLID", color: {r: 0.204, g: 0.227, b: 0.275}}];
wrapper.appendChild(label);
label.layoutSizingHorizontal = "FILL";

const field = figma.createFrame();
field.name = "Input";
field.layoutMode = "HORIZONTAL";
field.primaryAxisSizingMode = "AUTO";
field.counterAxisSizingMode = "AUTO";
field.counterAxisAlignItems = "CENTER";
field.paddingLeft = field.paddingRight = 14;
field.paddingTop = field.paddingBottom = 11;
field.cornerRadius = 10;
field.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
field.strokes = [{type: "SOLID", color: {r: 0.851, g: 0.863, b: 0.886}}];
field.strokeWeight = 1.5;

const placeholder = figma.createText();
placeholder.fontName = {family: "Inter", style: "Regular"};
placeholder.fontSize = 15;
placeholder.lineHeight = {unit: "PIXELS", value: 22};
placeholder.characters = "{{placeholder|Enter value...}}";
placeholder.fills = [{type: "SOLID", color: {r: 0.631, g: 0.655, b: 0.698}}];
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
