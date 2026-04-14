// Create Local Styles (Paint / Text / Effect)
// Usage: node figma-cli.js run scripts/create-style.js
// Edit STYLES array before running.

const STYLES = [
  {
    type: "PAINT",
    name: "Brand/Primary",
    paint: { type: "SOLID", color: { r: 0.231, g: 0.510, b: 0.965 } },
  },
  {
    type: "PAINT",
    name: "Brand/Secondary",
    paint: { type: "SOLID", color: { r: 0.557, g: 0.267, b: 0.678 } },
  },
  {
    type: "TEXT",
    name: "Heading/H1",
    fontSize: 32,
    fontName: { family: "Inter", style: "Bold" },
    lineHeight: { value: 40, unit: "PIXELS" },
  },
  {
    type: "EFFECT",
    name: "Shadow/md",
    effects: [
      {
        type: "DROP_SHADOW",
        color: { r: 0, g: 0, b: 0, a: 0.1 },
        offset: { x: 0, y: 4 },
        radius: 6,
        spread: 0,
        visible: true,
        blendMode: "NORMAL",
      },
    ],
  },
];

const results = [];

for (const s of STYLES) {
  if (s.type === "PAINT") {
    const style = figma.createPaintStyle();
    style.name = s.name;
    style.paints = [s.paint];
    results.push({ id: style.id, name: style.name, type: "PAINT" });
  } else if (s.type === "TEXT") {
    await figma.loadFontAsync(s.fontName);
    const style = figma.createTextStyle();
    style.name = s.name;
    style.fontSize = s.fontSize;
    style.fontName = s.fontName;
    if (s.lineHeight) style.lineHeight = s.lineHeight;
    results.push({ id: style.id, name: style.name, type: "TEXT" });
  } else if (s.type === "EFFECT") {
    const style = figma.createEffectStyle();
    style.name = s.name;
    style.effects = s.effects;
    results.push({ id: style.id, name: style.name, type: "EFFECT" });
  }
}

return { created: results.length, styles: results };
