// Create a local paint style
// Usage: node figma-cli.js tpl create-style --name "Brand/Primary" --color "#3B82F6"
//
// For text/effect styles, use `run` with a custom JS file.

const STYLE_NAME = "{{name}}";
const COLOR_HEX = "{{color|#3B82F6}}";

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  return {
    r: parseInt(hex.slice(0, 2), 16) / 255,
    g: parseInt(hex.slice(2, 4), 16) / 255,
    b: parseInt(hex.slice(4, 6), 16) / 255,
  };
}

const style = figma.createPaintStyle();
style.name = STYLE_NAME;
style.paints = [{ type: "SOLID", color: hexToRgb(COLOR_HEX) }];

return { id: style.id, name: style.name, type: "PAINT", color: COLOR_HEX };
