figma.showUI(__html__, { width: 340, height: 280, themeColors: true });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractNodeData(node: SceneNode, maxDepth?: number, _depth?: number): Record<string, unknown> {
  const base: Record<string, unknown> = {
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible,
  };

  if ("x" in node) base.x = node.x;
  if ("y" in node) base.y = node.y;
  if ("width" in node) base.width = node.width;
  if ("height" in node) base.height = node.height;
  if ("rotation" in node) base.rotation = node.rotation;
  if ("opacity" in node) base.opacity = node.opacity;
  if ("blendMode" in node) base.blendMode = node.blendMode;

  if ("fills" in node) {
    try { base.fills = JSON.parse(JSON.stringify(node.fills)); } catch { /* mixed */ }
  }
  if ("strokes" in node) {
    try { base.strokes = JSON.parse(JSON.stringify(node.strokes)); } catch { /* mixed */ }
  }
  if ("effects" in node) {
    try { base.effects = JSON.parse(JSON.stringify((node as any).effects)); } catch { /* mixed */ }
  }

  if ("strokeWeight" in node) base.strokeWeight = node.strokeWeight;
  if ("cornerRadius" in node) base.cornerRadius = node.cornerRadius;

  if ("characters" in node) {
    const t = node as TextNode;
    base.characters = t.characters;
    base.fontSize = t.fontSize;
    base.fontName = t.fontName;
    base.textAlignHorizontal = t.textAlignHorizontal;
    base.textAlignVertical = t.textAlignVertical;
    base.lineHeight = t.lineHeight;
    base.letterSpacing = t.letterSpacing;
  }

  if ("layoutMode" in node) {
    const f = node as FrameNode;
    base.layoutMode = f.layoutMode;
    base.primaryAxisSizingMode = f.primaryAxisSizingMode;
    base.counterAxisSizingMode = f.counterAxisSizingMode;
    base.primaryAxisAlignItems = f.primaryAxisAlignItems;
    base.counterAxisAlignItems = f.counterAxisAlignItems;
    base.paddingLeft = f.paddingLeft;
    base.paddingRight = f.paddingRight;
    base.paddingTop = f.paddingTop;
    base.paddingBottom = f.paddingBottom;
    base.itemSpacing = f.itemSpacing;
  }

  if ("children" in node) {
    const d = _depth ?? 0;
    const ch = (node as ChildrenMixin & SceneNode).children;
    if (maxDepth !== undefined && d >= maxDepth) {
      base.childCount = ch.length;
      base.childSummary = ch.map(c => {
        const s: Record<string, unknown> = { id: c.id, name: c.name, type: c.type };
        if (c.type === "TEXT") s.characters = (c as TextNode).characters;
        return s;
      });
    } else {
      base.children = ch.map(c => extractNodeData(c, maxDepth, d + 1));
    }
  }

  if ("cssAsync" in node) {
    base._hasCss = true;
  }

  return base;
}

async function getCssForNodes(nodes: readonly SceneNode[]): Promise<Map<string, Record<string, string>>> {
  const cssMap = new Map<string, Record<string, string>>();
  for (const node of nodes) {
    try {
      const css = await node.getCSSAsync();
      cssMap.set(node.id, css);
    } catch { /* some nodes don't support CSS */ }
    if ("children" in node) {
      const childCss = await getCssForNodes((node as ChildrenMixin & SceneNode).children);
      for (const [k, v] of childCss) cssMap.set(k, v);
    }
  }
  return cssMap;
}

function patchCss(data: Record<string, unknown>, cssMap: Map<string, Record<string, string>>): void {
  const id = data.id as string;
  if (cssMap.has(id)) data.css = cssMap.get(id);
  delete data._hasCss;
  if (Array.isArray(data.children)) {
    for (const child of data.children) patchCss(child as Record<string, unknown>, cssMap);
  }
}

function uint8ToBase64(bytes: Uint8Array): string {
  const lookup = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  const len = bytes.length;
  const rem = len % 3;
  const mainLen = len - rem;
  for (let i = 0; i < mainLen; i += 3) {
    const chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    result += lookup[(chunk >> 18) & 0x3f];
    result += lookup[(chunk >> 12) & 0x3f];
    result += lookup[(chunk >> 6) & 0x3f];
    result += lookup[chunk & 0x3f];
  }
  if (rem === 1) {
    const chunk = bytes[mainLen];
    result += lookup[(chunk >> 2) & 0x3f];
    result += lookup[(chunk << 4) & 0x3f];
    result += "==";
  } else if (rem === 2) {
    const chunk = (bytes[mainLen] << 8) | bytes[mainLen + 1];
    result += lookup[(chunk >> 10) & 0x3f];
    result += lookup[(chunk >> 4) & 0x3f];
    result += lookup[(chunk << 2) & 0x3f];
    result += "=";
  }
  return result;
}

function safeSerialize(value: unknown): unknown {
  if (value === undefined || value === null) return null;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    if (typeof value === "object" && value !== null && "id" in value) {
      return { id: (value as any).id, name: (value as any).name, type: (value as any).type };
    }
    return String(value);
  }
}

async function loadFontsForTextNode(textNode: TextNode): Promise<void> {
  const len = textNode.characters.length;
  if (len === 0) {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    return;
  }
  if (textNode.fontName !== figma.mixed) {
    await figma.loadFontAsync(textNode.fontName as FontName);
    return;
  }
  const fonts = textNode.getRangeAllFontNames(0, len);
  for (const font of fonts) {
    await figma.loadFontAsync(font);
  }
}

function applyProperties(node: SceneNode, properties: Record<string, unknown>): void {
  const props = { ...properties };

  const w = props.width;
  const h = props.height;
  if ((w !== undefined || h !== undefined) && "resize" in node) {
    const newW = typeof w === "number" ? w : (node as any).width ?? 100;
    const newH = typeof h === "number" ? h : (node as any).height ?? 100;
    (node as any).resize(newW, newH);
    delete props.width;
    delete props.height;
  }

  for (const [key, value] of Object.entries(props)) {
    try {
      (node as any)[key] = value;
    } catch { /* skip unsupported or readonly props */ }
  }
}

// ---------------------------------------------------------------------------
// Compact response helpers — reduce token usage for LLMs with limited context
// ---------------------------------------------------------------------------

function rgbToHex(c: { r: number; g: number; b: number }): string {
  const to = (v: number) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${to(c.r)}${to(c.g)}${to(c.b)}`;
}

function compactifyPaints(paints: any[]): any[] {
  return paints.map(p => {
    if (p.type === "SOLID" && p.color && typeof p.color === "object") {
      const out: any = { type: "SOLID", color: rgbToHex(p.color) };
      if (p.opacity !== undefined && p.opacity < 1) out.opacity = +(p.opacity).toFixed(2);
      return out;
    }
    return p;
  });
}

function skeletonify(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { id: data.id, name: data.name, type: data.type };
  if (data.type === "TEXT" && data.characters !== undefined) {
    out.characters = data.characters;
  }
  if (data.childCount !== undefined) out.childCount = data.childCount;
  if (data.childSummary) out.childSummary = data.childSummary;
  if (Array.isArray(data.children)) {
    out.childCount = (data.children as unknown[]).length;
    out.childSummary = (data.children as Record<string, unknown>[]).map(c => {
      const s: Record<string, unknown> = { id: c.id, name: c.name, type: c.type };
      if (c.type === "TEXT" && c.characters !== undefined) s.characters = c.characters;
      return s;
    });
  }
  return out;
}

const COMPACTIFY_DEFAULTS_OMITTED: string[] = ["visible", "opacity", "blendMode", "rotation"];

function compactify(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { id: data.id, name: data.name, type: data.type };

  const defaults: string[] = [];
  if (data.visible !== false) defaults.push("visible");
  else out.visible = false;

  if (data.x !== undefined) out.x = data.x;
  if (data.y !== undefined) out.y = data.y;
  if (data.width !== undefined) out.width = data.width;
  if (data.height !== undefined) out.height = data.height;

  if (data.rotation && data.rotation !== 0) out.rotation = data.rotation;
  else defaults.push("rotation");

  if (data.opacity !== undefined && data.opacity !== 1) out.opacity = data.opacity;
  else defaults.push("opacity");

  if (data.blendMode && data.blendMode !== "PASS_THROUGH") out.blendMode = data.blendMode;
  else defaults.push("blendMode");

  if (defaults.length > 0) out._defaults = defaults;

  if (Array.isArray(data.fills) && data.fills.length > 0) out.fills = compactifyPaints(data.fills);
  if (Array.isArray(data.strokes) && data.strokes.length > 0) out.strokes = compactifyPaints(data.strokes);
  if (Array.isArray(data.effects) && data.effects.length > 0) out.effects = data.effects;

  if (data.strokeWeight && data.strokeWeight !== 0) out.strokeWeight = data.strokeWeight;
  if (data.cornerRadius && data.cornerRadius !== 0) out.cornerRadius = data.cornerRadius;

  if (data.characters !== undefined) {
    out.characters = data.characters;
    out.fontSize = data.fontSize;
    if (data.fontName && typeof data.fontName === "object") {
      const fn = data.fontName as { family: string; style: string };
      out.font = `${fn.family}/${fn.style}`;
    }
  }

  if (data.layoutMode && data.layoutMode !== "NONE") {
    out.layoutMode = data.layoutMode;
    const pt = (data.paddingTop as number) || 0;
    const pr = (data.paddingRight as number) || 0;
    const pb = (data.paddingBottom as number) || 0;
    const pl = (data.paddingLeft as number) || 0;
    if (pt + pr + pb + pl > 0) out.padding = [pt, pr, pb, pl];
    if (data.itemSpacing) out.gap = data.itemSpacing;
    if (data.primaryAxisSizingMode) out.mainSizing = data.primaryAxisSizingMode;
    if (data.counterAxisSizingMode) out.crossSizing = data.counterAxisSizingMode;
    if (data.primaryAxisAlignItems) out.mainAlign = data.primaryAxisAlignItems;
    if (data.counterAxisAlignItems) out.crossAlign = data.counterAxisAlignItems;
  }

  if (data.childCount !== undefined) out.childCount = data.childCount;
  if (data.childSummary) {
    out.childSummary = (data.childSummary as Record<string, unknown>[]).map(c => {
      const s: Record<string, unknown> = { id: c.id, name: c.name, type: c.type };
      if (c.type === "TEXT" && c.characters !== undefined) s.characters = c.characters;
      return s;
    });
  }
  if (Array.isArray(data.children)) {
    out.children = (data.children as Record<string, unknown>[]).map(compactify);
  }

  return out;
}

const MAX_CHILDREN_EXPAND = 20;
const MAX_RESPONSE_BYTES = 500 * 1024;

function autoTruncate(data: Record<string, unknown>): Record<string, unknown> {
  const json = JSON.stringify(data);
  if (json.length <= MAX_RESPONSE_BYTES) return data;

  function truncateChildren(node: Record<string, unknown>): Record<string, unknown> {
    const out = { ...node };
    if (Array.isArray(out.children)) {
      const children = out.children as Record<string, unknown>[];
      if (children.length > MAX_CHILDREN_EXPAND) {
        const kept = children.slice(0, MAX_CHILDREN_EXPAND).map(truncateChildren);
        const rest = children.slice(MAX_CHILDREN_EXPAND).map(c => {
          const s: Record<string, unknown> = { id: c.id, name: c.name, type: c.type };
          if (c.type === "TEXT" && c.characters !== undefined) s.characters = c.characters;
          return s;
        });
        out.children = kept;
        out._truncatedChildren = rest;
        out._notice = `${children.length}개 자식 중 처음 ${MAX_CHILDREN_EXPAND}개만 전개됨. 나머지는 'children <id> --offset ${MAX_CHILDREN_EXPAND}'로 조회 가능.`;
      } else {
        out.children = children.map(truncateChildren);
      }
    }
    return out;
  }

  const result = truncateChildren(data);
  (result as any).truncated = true;
  return result;
}

// ---------------------------------------------------------------------------
// Message handler
// ---------------------------------------------------------------------------

figma.ui.onmessage = async (msg: { type: string; messageId?: string; payload?: any }) => {
  const { type, messageId } = msg;

  function reply(replyType: string, payload: unknown) {
    figma.ui.postMessage({ type: replyType, messageId, payload });
  }

  function replyError(replyType: string, error: string) {
    figma.ui.postMessage({ type: replyType, messageId, payload: { error } });
  }

  // ===================================================================
  // READ: Selection
  // ===================================================================
  if (type === "GET_SELECTION") {
    const compact = msg.payload?.compact ?? false;
    const skeleton = msg.payload?.skeleton ?? false;
    const depth = msg.payload?.depth as number | undefined;
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      reply("SELECTION_RESULT", { error: null, layers: [], message: "선택된 레이어가 없습니다." });
      return;
    }
    let layers: Record<string, unknown>[] = selection.map(n => extractNodeData(n, depth));
    if (skeleton) {
      layers = layers.map(skeletonify);
    } else if (compact) {
      layers = layers.map(l => autoTruncate(compactify(l)));
    } else {
      const cssMap = await getCssForNodes(selection);
      for (const layer of layers) patchCss(layer, cssMap);
    }
    reply("SELECTION_RESULT", { error: null, layers });
  }

  // ===================================================================
  // READ: Styles
  // ===================================================================
  else if (type === "GET_STYLES") {
    try {
      const rawPaint = await figma.getLocalPaintStylesAsync();
      const paintStyles = rawPaint.map((s) => ({
        id: s.id, name: s.name, type: "PAINT",
        paints: JSON.parse(JSON.stringify(s.paints)),
      }));
      const rawText = await figma.getLocalTextStylesAsync();
      const textStyles = rawText.map((s) => ({
        id: s.id, name: s.name, type: "TEXT",
        fontSize: s.fontSize, fontName: s.fontName,
        lineHeight: s.lineHeight, letterSpacing: s.letterSpacing,
        textCase: s.textCase, textDecoration: s.textDecoration,
      }));
      const rawEffect = await figma.getLocalEffectStylesAsync();
      const effectStyles = rawEffect.map((s) => ({
        id: s.id, name: s.name, type: "EFFECT",
        effects: JSON.parse(JSON.stringify(s.effects)),
      }));

      reply("STYLES_RESULT", { paintStyles, textStyles, effectStyles });
    } catch (err) {
      replyError("STYLES_RESULT", String(err));
    }
  }

  // ===================================================================
  // READ: Components
  // ===================================================================
  else if (type === "GET_COMPONENTS") {
    const components: Record<string, unknown>[] = [];
    function walk(node: BaseNode) {
      if (node.type === "COMPONENT") {
        components.push({
          id: node.id,
          name: node.name,
          description: (node as ComponentNode).description,
          width: (node as ComponentNode).width,
          height: (node as ComponentNode).height,
        });
      }
      if ("children" in node) {
        for (const child of (node as ChildrenMixin).children) walk(child);
      }
    }
    walk(figma.currentPage);
    reply("COMPONENTS_RESULT", { components });
  }

  // ===================================================================
  // READ: Get node by ID
  // ===================================================================
  else if (type === "GET_NODE_BY_ID") {
    try {
      const { nodeId, compact, skeleton, depth } = msg.payload;
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) {
        reply("NODE_RESULT", { error: null, node: null, message: `노드를 찾을 수 없습니다: ${nodeId}` });
        return;
      }
      if (node.type === "DOCUMENT" || node.type === "PAGE") {
        reply("NODE_RESULT", { error: null, node: { id: node.id, name: node.name, type: node.type } });
        return;
      }
      let data = extractNodeData(node as SceneNode, depth);
      if (skeleton) {
        data = skeletonify(data);
      } else if (compact) {
        data = autoTruncate(compactify(data));
      } else {
        const cssMap = await getCssForNodes([node as SceneNode]);
        patchCss(data, cssMap);
      }
      reply("NODE_RESULT", { error: null, node: data });
    } catch (err) {
      replyError("NODE_RESULT", String(err));
    }
  }

  // ===================================================================
  // WRITE: Create node
  // ===================================================================
  else if (type === "CREATE_NODE") {
    try {
      const { nodeType, properties, parentId, textContent, fontName } = msg.payload;
      let node: SceneNode;

      switch (nodeType) {
        case "FRAME": node = figma.createFrame(); break;
        case "RECTANGLE": node = figma.createRectangle(); break;
        case "ELLIPSE": node = figma.createEllipse(); break;
        case "LINE": node = figma.createLine(); break;
        case "POLYGON": node = figma.createPolygon(); break;
        case "STAR": node = figma.createStar(); break;
        case "VECTOR": node = figma.createVector(); break;
        case "COMPONENT": node = figma.createComponent(); break;
        case "SECTION": node = figma.createSection(); break;
        case "TEXT": {
          const textNode = figma.createText();
          await figma.loadFontAsync({ family: "Inter", style: "Regular" });
          if (fontName) {
            await figma.loadFontAsync(fontName);
            textNode.fontName = fontName;
          }
          if (textContent) textNode.characters = textContent;
          node = textNode;
          break;
        }
        default:
          replyError("CREATE_RESULT", `지원하지 않는 노드 타입: ${nodeType}`);
          return;
      }

      if (properties) applyProperties(node, properties);

      if (parentId) {
        const parent = await figma.getNodeByIdAsync(parentId);
        if (parent && "appendChild" in parent) {
          (parent as any).appendChild(node);
        }
      }

      reply("CREATE_RESULT", {
        error: null,
        nodeId: node.id,
        name: node.name,
        type: node.type,
      });
    } catch (err) {
      replyError("CREATE_RESULT", String(err));
    }
  }

  // ===================================================================
  // WRITE: Modify node
  // ===================================================================
  else if (type === "MODIFY_NODE") {
    try {
      const { nodeId, properties, textContent, fontName } = msg.payload;
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) {
        replyError("MODIFY_RESULT", `노드를 찾을 수 없습니다: ${nodeId}`);
        return;
      }

      if (textContent !== undefined && node.type === "TEXT") {
        const textNode = node as TextNode;
        if (fontName) {
          await figma.loadFontAsync(fontName);
        } else {
          await loadFontsForTextNode(textNode);
        }
        textNode.characters = textContent;
        if (fontName) textNode.fontName = fontName;
      }

      if (properties && node.type !== "DOCUMENT" && node.type !== "PAGE") {
        applyProperties(node as SceneNode, properties);
      }

      reply("MODIFY_RESULT", { error: null, nodeId: node.id, name: node.name });
    } catch (err) {
      replyError("MODIFY_RESULT", String(err));
    }
  }

  // ===================================================================
  // WRITE: Delete nodes
  // ===================================================================
  else if (type === "DELETE_NODES") {
    try {
      const { nodeIds } = msg.payload;
      const deleted: string[] = [];
      const notFound: string[] = [];

      for (const id of nodeIds) {
        const node = await figma.getNodeByIdAsync(id);
        if (node && node.type !== "DOCUMENT" && node.type !== "PAGE") {
          node.remove();
          deleted.push(id);
        } else {
          notFound.push(id);
        }
      }

      reply("DELETE_RESULT", { error: null, deleted, notFound });
    } catch (err) {
      replyError("DELETE_RESULT", String(err));
    }
  }

  // ===================================================================
  // EXPORT: Export node as image
  // ===================================================================
  else if (type === "EXPORT_NODE") {
    try {
      const { nodeId, format, scale } = msg.payload;
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node || !("exportAsync" in node)) {
        replyError("EXPORT_RESULT", `내보낼 수 없는 노드입니다: ${nodeId}`);
        return;
      }

      const fmt = format || "PNG";
      const exportSettings: any = { format: fmt };
      if (fmt === "PNG" || fmt === "JPG") {
        exportSettings.constraint = { type: "SCALE", value: scale || 1 };
      }

      const bytes = await (node as SceneNode).exportAsync(exportSettings);

      if (fmt === "SVG") {
        let svgStr = "";
        for (let i = 0; i < bytes.length; i++) svgStr += String.fromCharCode(bytes[i]);
        reply("EXPORT_RESULT", { error: null, format: "SVG", data: svgStr });
      } else {
        reply("EXPORT_RESULT", { error: null, format: fmt, data: uint8ToBase64(bytes), encoding: "base64" });
      }
    } catch (err) {
      replyError("EXPORT_RESULT", String(err));
    }
  }

  // ===================================================================
  // READ: Get children page (paginated)
  // ===================================================================
  else if (type === "GET_CHILDREN_PAGE") {
    try {
      const { nodeId, offset = 0, limit = 20, depth, compact, skeleton } = msg.payload;
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node || !("children" in node)) {
        replyError("CHILDREN_PAGE_RESULT", `자식을 가진 노드가 아닙니다: ${nodeId}`);
        return;
      }
      const parent = node as ChildrenMixin & BaseNode;
      const total = parent.children.length;
      const slice = parent.children.slice(offset, offset + limit) as SceneNode[];

      let items: Record<string, unknown>[] = slice.map(n => extractNodeData(n, depth));
      if (skeleton) {
        items = items.map(skeletonify);
      } else if (compact !== false) {
        items = items.map(compactify);
      } else {
        const cssMap = await getCssForNodes(slice);
        for (const item of items) patchCss(item, cssMap);
      }

      reply("CHILDREN_PAGE_RESULT", {
        error: null,
        parentId: nodeId,
        total,
        offset,
        limit,
        returned: items.length,
        hasMore: offset + limit < total,
        children: items,
      });
    } catch (err) {
      replyError("CHILDREN_PAGE_RESULT", String(err));
    }
  }

  // ===================================================================
  // UNIVERSAL: Run arbitrary Figma Plugin API code
  // ===================================================================
  else if (type === "RUN_CODE") {
    try {
      const { code } = msg.payload;
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      const fn = new AsyncFunction("figma", code);
      const result = await fn(figma);
      reply("CODE_RESULT", { error: null, result: safeSerialize(result) });
    } catch (err) {
      replyError("CODE_RESULT", String(err));
    }
  }
};
