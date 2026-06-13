// Login Page — 완성된 로그인 화면 레이아웃
// Usage: node figma-cli.js run scripts/login-page.js

await figma.loadFontAsync({family: "Inter", style: "Bold"});
await figma.loadFontAsync({family: "Inter", style: "Semi Bold"});
await figma.loadFontAsync({family: "Inter", style: "Regular"});
await figma.loadFontAsync({family: "Inter", style: "Medium"});

const page = figma.createFrame();
page.name = "Login Page";
page.resize(1440, 900);
page.layoutMode = "HORIZONTAL";
page.fills = [{type: "SOLID", color: {r: 0.976, g: 0.976, b: 0.984}}];

// Left panel — branding
const left = figma.createFrame();
left.name = "Branding";
left.resize(680, 900);
left.layoutMode = "VERTICAL";
left.primaryAxisAlignItems = "CENTER";
left.counterAxisAlignItems = "CENTER";
left.paddingLeft = left.paddingRight = 60;
left.itemSpacing = 16;
left.fills = [{type: "SOLID", color: {r: 0.231, g: 0.510, b: 0.965}}];
page.appendChild(left);

const brandIcon = figma.createFrame();
brandIcon.name = "Icon";
brandIcon.resize(64, 64);
brandIcon.cornerRadius = 18;
brandIcon.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}, opacity: 0.15}];
left.appendChild(brandIcon);

const spacer1 = figma.createFrame();
spacer1.resize(10, 8);
spacer1.fills = [];
left.appendChild(spacer1);

const brandTitle = figma.createText();
brandTitle.fontName = {family: "Inter", style: "Bold"};
brandTitle.fontSize = 32;
brandTitle.lineHeight = {unit: "PIXELS", value: 40};
brandTitle.characters = "Welcome Back";
brandTitle.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
brandTitle.textAlignHorizontal = "CENTER";
left.appendChild(brandTitle);

const brandSub = figma.createText();
brandSub.fontName = {family: "Inter", style: "Regular"};
brandSub.fontSize = 16;
brandSub.lineHeight = {unit: "PIXELS", value: 24};
brandSub.characters = "Sign in to continue to your dashboard";
brandSub.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}, opacity: 0.7}];
brandSub.textAlignHorizontal = "CENTER";
left.appendChild(brandSub);

// Right panel — form
const right = figma.createFrame();
right.name = "Form Panel";
right.resize(760, 900);
right.layoutMode = "VERTICAL";
right.primaryAxisAlignItems = "CENTER";
right.counterAxisAlignItems = "CENTER";
right.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
page.appendChild(right);

const form = figma.createFrame();
form.name = "Login Form";
form.resize(380, 10);
form.layoutMode = "VERTICAL";
form.primaryAxisSizingMode = "AUTO";
form.counterAxisSizingMode = "FIXED";
form.itemSpacing = 20;
form.fills = [];
right.appendChild(form);

const heading = figma.createText();
heading.fontName = {family: "Inter", style: "Bold"};
heading.fontSize = 26;
heading.lineHeight = {unit: "PIXELS", value: 34};
heading.characters = "Sign In";
heading.fills = [{type: "SOLID", color: {r: 0.067, g: 0.094, b: 0.153}}];
form.appendChild(heading);
heading.layoutSizingHorizontal = "FILL";

const subheading = figma.createText();
subheading.fontName = {family: "Inter", style: "Regular"};
subheading.fontSize = 15;
subheading.lineHeight = {unit: "PIXELS", value: 22};
subheading.characters = "Enter your credentials to access your account";
subheading.fills = [{type: "SOLID", color: {r: 0.420, g: 0.447, b: 0.498}}];
form.appendChild(subheading);
subheading.layoutSizingHorizontal = "FILL";

const spacer2 = figma.createFrame();
spacer2.resize(10, 4);
spacer2.fills = [];
form.appendChild(spacer2);

function createField(labelText, placeholderText) {
  const wrapper = figma.createFrame();
  wrapper.name = labelText;
  wrapper.layoutMode = "VERTICAL";
  wrapper.primaryAxisSizingMode = "AUTO";
  wrapper.counterAxisSizingMode = "AUTO";
  wrapper.itemSpacing = 7;
  wrapper.fills = [];

  const lbl = figma.createText();
  lbl.fontName = {family: "Inter", style: "Medium"};
  lbl.fontSize = 14;
  lbl.lineHeight = {unit: "PIXELS", value: 20};
  lbl.characters = labelText;
  lbl.fills = [{type: "SOLID", color: {r: 0.204, g: 0.227, b: 0.275}}];
  wrapper.appendChild(lbl);
  lbl.layoutSizingHorizontal = "FILL";

  const field = figma.createFrame();
  field.name = "Input";
  field.layoutMode = "HORIZONTAL";
  field.primaryAxisSizingMode = "AUTO";
  field.counterAxisSizingMode = "AUTO";
  field.counterAxisAlignItems = "CENTER";
  field.paddingLeft = field.paddingRight = 14;
  field.paddingTop = field.paddingBottom = 12;
  field.cornerRadius = 10;
  field.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
  field.strokes = [{type: "SOLID", color: {r: 0.851, g: 0.863, b: 0.886}}];
  field.strokeWeight = 1.5;

  const ph = figma.createText();
  ph.fontName = {family: "Inter", style: "Regular"};
  ph.fontSize = 15;
  ph.lineHeight = {unit: "PIXELS", value: 22};
  ph.characters = placeholderText;
  ph.fills = [{type: "SOLID", color: {r: 0.631, g: 0.655, b: 0.698}}];
  field.appendChild(ph);
  ph.layoutSizingHorizontal = "FILL";

  wrapper.appendChild(field);
  field.layoutSizingHorizontal = "FILL";
  return wrapper;
}

const emailField = createField("Email", "name@company.com");
form.appendChild(emailField);
emailField.layoutSizingHorizontal = "FILL";

const passField = createField("Password", "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022");
form.appendChild(passField);
passField.layoutSizingHorizontal = "FILL";

const spacer3 = figma.createFrame();
spacer3.resize(10, 2);
spacer3.fills = [];
form.appendChild(spacer3);

const btn = figma.createFrame();
btn.name = "Sign In Button";
btn.layoutMode = "HORIZONTAL";
btn.primaryAxisSizingMode = "AUTO";
btn.counterAxisSizingMode = "AUTO";
btn.primaryAxisAlignItems = "CENTER";
btn.counterAxisAlignItems = "CENTER";
btn.paddingTop = btn.paddingBottom = 13;
btn.paddingLeft = btn.paddingRight = 16;
btn.cornerRadius = 10;
btn.fills = [{type: "SOLID", color: {r: 0.231, g: 0.510, b: 0.965}}];
const btnText = figma.createText();
btnText.fontName = {family: "Inter", style: "Semi Bold"};
btnText.fontSize = 16;
btnText.lineHeight = {unit: "PIXELS", value: 22};
btnText.characters = "Sign In";
btnText.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
btn.appendChild(btnText);
form.appendChild(btn);
btn.layoutSizingHorizontal = "FILL";

const dividerRow = figma.createFrame();
dividerRow.name = "Divider";
dividerRow.layoutMode = "HORIZONTAL";
dividerRow.primaryAxisSizingMode = "AUTO";
dividerRow.counterAxisSizingMode = "AUTO";
dividerRow.counterAxisAlignItems = "CENTER";
dividerRow.itemSpacing = 12;
dividerRow.fills = [];
const divL = figma.createRectangle();
divL.resize(100, 1);
divL.fills = [{type: "SOLID", color: {r: 0.910, g: 0.918, b: 0.933}}];
dividerRow.appendChild(divL);
divL.layoutGrow = 1;
const orText = figma.createText();
orText.fontName = {family: "Inter", style: "Medium"};
orText.fontSize = 13;
orText.characters = "OR";
orText.fills = [{type: "SOLID", color: {r: 0.631, g: 0.655, b: 0.698}}];
dividerRow.appendChild(orText);
const divR = figma.createRectangle();
divR.resize(100, 1);
divR.fills = [{type: "SOLID", color: {r: 0.910, g: 0.918, b: 0.933}}];
dividerRow.appendChild(divR);
divR.layoutGrow = 1;
form.appendChild(dividerRow);
dividerRow.layoutSizingHorizontal = "FILL";

const googleBtn = figma.createFrame();
googleBtn.name = "Google Sign In";
googleBtn.layoutMode = "HORIZONTAL";
googleBtn.primaryAxisSizingMode = "AUTO";
googleBtn.counterAxisSizingMode = "AUTO";
googleBtn.primaryAxisAlignItems = "CENTER";
googleBtn.counterAxisAlignItems = "CENTER";
googleBtn.paddingTop = googleBtn.paddingBottom = 12;
googleBtn.paddingLeft = googleBtn.paddingRight = 16;
googleBtn.cornerRadius = 10;
googleBtn.fills = [];
googleBtn.strokes = [{type: "SOLID", color: {r: 0.851, g: 0.863, b: 0.886}}];
googleBtn.strokeWeight = 1.5;
const gText = figma.createText();
gText.fontName = {family: "Inter", style: "Semi Bold"};
gText.fontSize = 15;
gText.lineHeight = {unit: "PIXELS", value: 22};
gText.characters = "Continue with Google";
gText.fills = [{type: "SOLID", color: {r: 0.204, g: 0.227, b: 0.275}}];
googleBtn.appendChild(gText);
form.appendChild(googleBtn);
googleBtn.layoutSizingHorizontal = "FILL";

const footer = figma.createText();
footer.fontName = {family: "Inter", style: "Regular"};
footer.fontSize = 14;
footer.lineHeight = {unit: "PIXELS", value: 20};
footer.characters = "Don\u2019t have an account? Sign up";
footer.fills = [{type: "SOLID", color: {r: 0.420, g: 0.447, b: 0.498}}];
footer.textAlignHorizontal = "CENTER";
form.appendChild(footer);
footer.layoutSizingHorizontal = "FILL";

figma.currentPage.selection = [page];
figma.viewport.scrollAndZoomIntoView([page]);
return {id: page.id, w: page.width, h: page.height};
