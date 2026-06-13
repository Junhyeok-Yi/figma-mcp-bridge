// RUN_CODE body: 선택된 프레임 트리에 부드러운 다크 톤 적용 (템플릿 팔레트와 동일 계열)
const BG = { r: 0.09, g: 0.091, b: 0.098 };
const CARD = { r: 0.13, g: 0.132, b: 0.145 };
const TITLE = { r: 0.93, g: 0.94, b: 0.96 };
const DESC = { r: 0.58, g: 0.6, b: 0.64 };

function lum(rgb) {
  const r = rgb.r ?? 0, g = rgb.g ?? 0, b = rgb.b ?? 0;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function collectFonts(node, set) {
  if (node.type === "TEXT") set.add(JSON.stringify(node.fontName));
  if ("children" in node) {
    for (const c of node.children) collectFonts(c, set);
  }
}

function paintNode(node, depth, rootId) {
  if (node.type === "TEXT") {
    const fills = node.fills;
    if (Array.isArray(fills) && fills.length && fills[0].type === "SOLID") {
      const L = lum(fills[0].color);
      const o = fills[0].opacity != null ? fills[0].opacity : 1;
      if (L > 0.92) node.fills = [{ type: "SOLID", color: TITLE, opacity: o }];
      else if (L >= 0.32 && L <= 0.92) node.fills = [{ type: "SOLID", color: DESC, opacity: o }];
    }
    return;
  }

  if ("fills" in node && Array.isArray(node.fills)) {
    const nf = [];
    for (const f of node.fills) {
      if (f.type === "SOLID" && f.visible !== false) {
        const L = lum(f.color);
        if (L < 0.22) {
          const col = node.id === rootId && depth === 0 ? BG : CARD;
          nf.push({ ...f, color: col });
        } else nf.push(f);
      } else nf.push(f);
    }
    node.fills = nf;
  }

  if ("strokes" in node && Array.isArray(node.strokes) && node.strokes.length) {
    node.strokes = node.strokes.map((s) => {
      if (s.type === "SOLID" && lum(s.color) > 0.9) {
        const o = s.opacity != null ? s.opacity : 1;
        return { ...s, opacity: Math.min(o, 0.065) };
      }
      return s;
    });
  }

  if ("children" in node) {
    for (const c of node.children) paintNode(c, depth + 1, rootId);
  }
}

const sel = figma.currentPage.selection;
if (!sel.length) return { ok: false, reason: "선택된 노드가 없습니다." };

const fontKeys = new Set();
for (const n of sel) collectFonts(n, fontKeys);
for (const key of fontKeys) {
  try {
    await figma.loadFontAsync(JSON.parse(key));
  } catch (e) {}
}

const updated = [];
for (const n of sel) {
  paintNode(n, 0, n.id);
  updated.push({ id: n.id, name: n.name });
}
return { ok: true, updated };
