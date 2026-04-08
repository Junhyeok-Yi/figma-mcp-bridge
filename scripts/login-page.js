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
page.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];

// Left panel — branding
const left = figma.createFrame();
left.name = "Branding";
left.resize(720, 900);
left.layoutMode = "VERTICAL";
left.primaryAxisAlignItems = "CENTER";
left.counterAxisAlignItems = "CENTER";
left.fills = [{type: "SOLID", color: {r: 0.231, g: 0.510, b: 0.965}}];
left.itemSpacing = 24;
page.appendChild(left);

const brandIcon = figma.createEllipse();
brandIcon.resize(80, 80);
brandIcon.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}, opacity: 0.2}];
left.appendChild(brandIcon);

const brandTitle = figma.createText();
brandTitle.fontName = {family: "Inter", style: "Bold"};
brandTitle.fontSize = 36;
brandTitle.characters = "Welcome Back";
brandTitle.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
brandTitle.textAlignHorizontal = "CENTER";
left.appendChild(brandTitle);

const brandSub = figma.createText();
brandSub.fontName = {family: "Inter", style: "Regular"};
brandSub.fontSize = 16;
brandSub.characters = "Sign in to continue to your dashboard";
brandSub.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}, opacity: 0.8}];
brandSub.textAlignHorizontal = "CENTER";
left.appendChild(brandSub);

// Right panel — form
const right = figma.createFrame();
right.name = "Form Panel";
right.resize(720, 900);
right.layoutMode = "VERTICAL";
right.primaryAxisAlignItems = "CENTER";
right.counterAxisAlignItems = "CENTER";
right.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
page.appendChild(right);

const form = figma.createFrame();
form.name = "Login Form";
form.resize(400, 10);
form.layoutMode = "VERTICAL";
form.primaryAxisSizingMode = "AUTO";
form.counterAxisSizingMode = "FIXED";
form.itemSpacing = 24;
form.fills = [];
right.appendChild(form);

// Form heading
const heading = figma.createText();
heading.fontName = {family: "Inter", style: "Bold"};
heading.fontSize = 28;
heading.characters = "Sign In";
heading.fills = [{type: "SOLID", color: {r: 0.067, g: 0.094, b: 0.153}}];
form.appendChild(heading);
heading.layoutSizingHorizontal = "FILL";

const subheading = figma.createText();
subheading.fontName = {family: "Inter", style: "Regular"};
subheading.fontSize = 14;
subheading.characters = "Enter your credentials to access your account";
subheading.fills = [{type: "SOLID", color: {r: 0.420, g: 0.447, b: 0.498}}];
form.appendChild(subheading);
subheading.layoutSizingHorizontal = "FILL";

// Input fields
function createField(labelText, placeholderText) {
  const wrapper = figma.createFrame();
  wrapper.name = labelText;
  wrapper.layoutMode = "VERTICAL";
  wrapper.primaryAxisSizingMode = "AUTO";
  wrapper.counterAxisSizingMode = "AUTO";
  wrapper.itemSpacing = 6;
  wrapper.fills = [];

  const lbl = figma.createText();
  lbl.fontName = {family: "Inter", style: "Medium"};
  lbl.fontSize = 14;
  lbl.characters = labelText;
  lbl.fills = [{type: "SOLID", color: {r: 0.067, g: 0.094, b: 0.153}}];
  wrapper.appendChild(lbl);
  lbl.layoutSizingHorizontal = "FILL";

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

  const ph = figma.createText();
  ph.fontName = {family: "Inter", style: "Regular"};
  ph.fontSize = 14;
  ph.characters = placeholderText;
  ph.fills = [{type: "SOLID", color: {r: 0.612, g: 0.639, b: 0.686}}];
  field.appendChild(ph);
  ph.layoutSizingHorizontal = "FILL";

  wrapper.appendChild(field);
  field.layoutSizingHorizontal = "FILL";

  return wrapper;
}

const emailField = createField("Email", "name@company.com");
form.appendChild(emailField);
emailField.layoutSizingHorizontal = "FILL";

const passField = createField("Password", "••••••••");
form.appendChild(passField);
passField.layoutSizingHorizontal = "FILL";

// Sign in button
const btn = figma.createFrame();
btn.name = "Sign In Button";
btn.layoutMode = "HORIZONTAL";
btn.primaryAxisAlignItems = "CENTER";
btn.counterAxisAlignItems = "CENTER";
btn.paddingTop = btn.paddingBottom = 12;
btn.paddingLeft = btn.paddingRight = 16;
btn.cornerRadius = 8;
btn.fills = [{type: "SOLID", color: {r: 0.231, g: 0.510, b: 0.965}}];
const btnText = figma.createText();
btnText.fontName = {family: "Inter", style: "Semi Bold"};
btnText.fontSize = 16;
btnText.characters = "Sign In";
btnText.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
btn.appendChild(btnText);
form.appendChild(btn);
btn.layoutSizingHorizontal = "FILL";

// Footer text
const footer = figma.createText();
footer.fontName = {family: "Inter", style: "Regular"};
footer.fontSize = 14;
footer.characters = "Don't have an account? Sign up";
footer.fills = [{type: "SOLID", color: {r: 0.420, g: 0.447, b: 0.498}}];
footer.textAlignHorizontal = "CENTER";
form.appendChild(footer);
footer.layoutSizingHorizontal = "FILL";

figma.currentPage.selection = [page];
figma.viewport.scrollAndZoomIntoView([page]);
return {id: page.id, w: page.width, h: page.height};
