// Color Palette — DESIGN.md 기반 색상 스와치 생성
// Usage: node figma-cli.js run scripts/color-palette.js

await figma.loadFontAsync({family: "Inter", style: "Medium"});
await figma.loadFontAsync({family: "Inter", style: "Regular"});

const palettes = [
  {name: "Gray",    colors: [{n:"50",c:"#F9FAFB"},{n:"100",c:"#F3F4F6"},{n:"200",c:"#E5E7EB"},{n:"300",c:"#D1D5DB"},{n:"400",c:"#9CA3AF"},{n:"500",c:"#6B7280"},{n:"600",c:"#4B5563"},{n:"700",c:"#374151"},{n:"800",c:"#1F2937"},{n:"900",c:"#111827"}]},
  {name: "Blue",    colors: [{n:"50",c:"#EFF6FF"},{n:"100",c:"#DBEAFE"},{n:"200",c:"#BFDBFE"},{n:"300",c:"#93C5FD"},{n:"400",c:"#60A5FA"},{n:"500",c:"#3B82F6"},{n:"600",c:"#2563EB"},{n:"700",c:"#1D4ED8"},{n:"800",c:"#1E40AF"},{n:"900",c:"#1E3A8A"}]},
  {name: "Green",   colors: [{n:"50",c:"#ECFDF5"},{n:"100",c:"#D1FAE5"},{n:"200",c:"#A7F3D0"},{n:"300",c:"#6EE7B7"},{n:"400",c:"#34D399"},{n:"500",c:"#10B981"},{n:"600",c:"#059669"},{n:"700",c:"#047857"},{n:"800",c:"#065F46"},{n:"900",c:"#064E3B"}]},
  {name: "Red",     colors: [{n:"50",c:"#FEF2F2"},{n:"100",c:"#FEE2E2"},{n:"200",c:"#FECACA"},{n:"300",c:"#FCA5A5"},{n:"400",c:"#F87171"},{n:"500",c:"#EF4444"},{n:"600",c:"#DC2626"},{n:"700",c:"#B91C1C"},{n:"800",c:"#991B1B"},{n:"900",c:"#7F1D1D"}]},
  {name: "Amber",   colors: [{n:"50",c:"#FFFBEB"},{n:"100",c:"#FEF3C7"},{n:"200",c:"#FDE68A"},{n:"300",c:"#FCD34D"},{n:"400",c:"#FBBF24"},{n:"500",c:"#F59E0B"},{n:"600",c:"#D97706"},{n:"700",c:"#B45309"},{n:"800",c:"#92400E"},{n:"900",c:"#78350F"}]},
];

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  return {
    r: parseInt(hex.slice(0,2),16)/255,
    g: parseInt(hex.slice(2,4),16)/255,
    b: parseInt(hex.slice(4,6),16)/255,
  };
}

function luminance(hex) {
  const c = hexToRgb(hex);
  return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
}

const SWATCH_W = 80;
const SWATCH_H = 80;
const GAP = 4;
const ROW_GAP = 24;

const container = figma.createFrame();
container.name = "Color Palette";
container.layoutMode = "VERTICAL";
container.primaryAxisSizingMode = "AUTO";
container.counterAxisSizingMode = "AUTO";
container.itemSpacing = ROW_GAP;
container.fills = [];

for (const palette of palettes) {
  const row = figma.createFrame();
  row.name = palette.name;
  row.layoutMode = "VERTICAL";
  row.primaryAxisSizingMode = "AUTO";
  row.counterAxisSizingMode = "AUTO";
  row.itemSpacing = 8;
  row.fills = [];

  const label = figma.createText();
  label.fontName = {family: "Inter", style: "Medium"};
  label.fontSize = 14;
  label.characters = palette.name;
  label.fills = [{type: "SOLID", color: {r: 0.067, g: 0.094, b: 0.153}}];
  row.appendChild(label);

  const swatches = figma.createFrame();
  swatches.name = "Swatches";
  swatches.layoutMode = "HORIZONTAL";
  swatches.primaryAxisSizingMode = "AUTO";
  swatches.counterAxisSizingMode = "AUTO";
  swatches.itemSpacing = GAP;
  swatches.fills = [];

  for (const {n, c} of palette.colors) {
    const swatch = figma.createFrame();
    swatch.name = `${palette.name}-${n}`;
    swatch.resize(SWATCH_W, SWATCH_H);
    swatch.layoutMode = "VERTICAL";
    swatch.primaryAxisAlignItems = "MAX";
    swatch.paddingLeft = swatch.paddingRight = 8;
    swatch.paddingBottom = 8;
    swatch.fills = [{type: "SOLID", color: hexToRgb(c)}];
    if (n === "50" || n === "100") {
      swatch.cornerRadius = n === "50" ? 8 : 0;
    }

    const nameText = figma.createText();
    nameText.fontName = {family: "Inter", style: "Regular"};
    nameText.fontSize = 10;
    nameText.characters = n;
    const textColor = luminance(c) > 0.5 ? {r:0.3,g:0.3,b:0.35} : {r:1,g:1,b:1};
    nameText.fills = [{type: "SOLID", color: textColor}];
    swatch.appendChild(nameText);

    swatches.appendChild(swatch);
  }

  row.appendChild(swatches);
  container.appendChild(row);
}

figma.currentPage.selection = [container];
figma.viewport.scrollAndZoomIntoView([container]);
return {id: container.id, palettes: palettes.length, swatches: palettes.length * 10};
