"use strict";
figma.showUI(__html__, { width: 340, height: 280, themeColors: true });
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function extractNodeData(node) {
    const base = {
        id: node.id,
        name: node.name,
        type: node.type,
        visible: node.visible,
    };
    if ("x" in node)
        base.x = node.x;
    if ("y" in node)
        base.y = node.y;
    if ("width" in node)
        base.width = node.width;
    if ("height" in node)
        base.height = node.height;
    if ("rotation" in node)
        base.rotation = node.rotation;
    if ("opacity" in node)
        base.opacity = node.opacity;
    if ("blendMode" in node)
        base.blendMode = node.blendMode;
    if ("fills" in node) {
        try {
            base.fills = JSON.parse(JSON.stringify(node.fills));
        }
        catch ( /* mixed */_a) { /* mixed */ }
    }
    if ("strokes" in node) {
        try {
            base.strokes = JSON.parse(JSON.stringify(node.strokes));
        }
        catch ( /* mixed */_b) { /* mixed */ }
    }
    if ("effects" in node) {
        try {
            base.effects = JSON.parse(JSON.stringify(node.effects));
        }
        catch ( /* mixed */_c) { /* mixed */ }
    }
    if ("strokeWeight" in node)
        base.strokeWeight = node.strokeWeight;
    if ("cornerRadius" in node)
        base.cornerRadius = node.cornerRadius;
    if ("characters" in node) {
        const t = node;
        base.characters = t.characters;
        base.fontSize = t.fontSize;
        base.fontName = t.fontName;
        base.textAlignHorizontal = t.textAlignHorizontal;
        base.textAlignVertical = t.textAlignVertical;
        base.lineHeight = t.lineHeight;
        base.letterSpacing = t.letterSpacing;
    }
    if ("layoutMode" in node) {
        const f = node;
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
        base.children = node.children.map(extractNodeData);
    }
    if ("cssAsync" in node) {
        base._hasCss = true;
    }
    return base;
}
async function getCssForNodes(nodes) {
    const cssMap = new Map();
    for (const node of nodes) {
        try {
            const css = await node.getCSSAsync();
            cssMap.set(node.id, css);
        }
        catch ( /* some nodes don't support CSS */_a) { /* some nodes don't support CSS */ }
        if ("children" in node) {
            const childCss = await getCssForNodes(node.children);
            for (const [k, v] of childCss)
                cssMap.set(k, v);
        }
    }
    return cssMap;
}
function patchCss(data, cssMap) {
    const id = data.id;
    if (cssMap.has(id))
        data.css = cssMap.get(id);
    delete data._hasCss;
    if (Array.isArray(data.children)) {
        for (const child of data.children)
            patchCss(child, cssMap);
    }
}
function uint8ToBase64(bytes) {
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
    }
    else if (rem === 2) {
        const chunk = (bytes[mainLen] << 8) | bytes[mainLen + 1];
        result += lookup[(chunk >> 10) & 0x3f];
        result += lookup[(chunk >> 4) & 0x3f];
        result += lookup[(chunk << 2) & 0x3f];
        result += "=";
    }
    return result;
}
function safeSerialize(value) {
    if (value === undefined || value === null)
        return null;
    try {
        return JSON.parse(JSON.stringify(value));
    }
    catch (_a) {
        if (typeof value === "object" && value !== null && "id" in value) {
            return { id: value.id, name: value.name, type: value.type };
        }
        return String(value);
    }
}
async function loadFontsForTextNode(textNode) {
    const len = textNode.characters.length;
    if (len === 0) {
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });
        return;
    }
    if (textNode.fontName !== figma.mixed) {
        await figma.loadFontAsync(textNode.fontName);
        return;
    }
    const fonts = textNode.getRangeAllFontNames(0, len);
    for (const font of fonts) {
        await figma.loadFontAsync(font);
    }
}
function applyProperties(node, properties) {
    var _a, _b;
    const props = Object.assign({}, properties);
    const w = props.width;
    const h = props.height;
    if ((w !== undefined || h !== undefined) && "resize" in node) {
        const newW = typeof w === "number" ? w : (_a = node.width) !== null && _a !== void 0 ? _a : 100;
        const newH = typeof h === "number" ? h : (_b = node.height) !== null && _b !== void 0 ? _b : 100;
        node.resize(newW, newH);
        delete props.width;
        delete props.height;
    }
    for (const [key, value] of Object.entries(props)) {
        try {
            node[key] = value;
        }
        catch ( /* skip unsupported or readonly props */_c) { /* skip unsupported or readonly props */ }
    }
}
// ---------------------------------------------------------------------------
// Message handler
// ---------------------------------------------------------------------------
figma.ui.onmessage = async (msg) => {
    const { type, messageId } = msg;
    function reply(replyType, payload) {
        figma.ui.postMessage({ type: replyType, messageId, payload });
    }
    function replyError(replyType, error) {
        figma.ui.postMessage({ type: replyType, messageId, payload: { error } });
    }
    // ===================================================================
    // READ: Selection
    // ===================================================================
    if (type === "GET_SELECTION") {
        const selection = figma.currentPage.selection;
        if (selection.length === 0) {
            reply("SELECTION_RESULT", { error: null, layers: [], message: "선택된 레이어가 없습니다." });
            return;
        }
        const layers = selection.map(extractNodeData);
        const cssMap = await getCssForNodes(selection);
        for (const layer of layers)
            patchCss(layer, cssMap);
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
        }
        catch (err) {
            replyError("STYLES_RESULT", String(err));
        }
    }
    // ===================================================================
    // READ: Components
    // ===================================================================
    else if (type === "GET_COMPONENTS") {
        const components = [];
        function walk(node) {
            if (node.type === "COMPONENT") {
                components.push({
                    id: node.id,
                    name: node.name,
                    description: node.description,
                    width: node.width,
                    height: node.height,
                });
            }
            if ("children" in node) {
                for (const child of node.children)
                    walk(child);
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
            const { nodeId } = msg.payload;
            const node = await figma.getNodeByIdAsync(nodeId);
            if (!node) {
                reply("NODE_RESULT", { error: null, node: null, message: `노드를 찾을 수 없습니다: ${nodeId}` });
                return;
            }
            if (node.type === "DOCUMENT" || node.type === "PAGE") {
                reply("NODE_RESULT", { error: null, node: { id: node.id, name: node.name, type: node.type } });
                return;
            }
            const data = extractNodeData(node);
            const cssMap = await getCssForNodes([node]);
            patchCss(data, cssMap);
            reply("NODE_RESULT", { error: null, node: data });
        }
        catch (err) {
            replyError("NODE_RESULT", String(err));
        }
    }
    // ===================================================================
    // WRITE: Create node
    // ===================================================================
    else if (type === "CREATE_NODE") {
        try {
            const { nodeType, properties, parentId, textContent, fontName } = msg.payload;
            let node;
            switch (nodeType) {
                case "FRAME":
                    node = figma.createFrame();
                    break;
                case "RECTANGLE":
                    node = figma.createRectangle();
                    break;
                case "ELLIPSE":
                    node = figma.createEllipse();
                    break;
                case "LINE":
                    node = figma.createLine();
                    break;
                case "POLYGON":
                    node = figma.createPolygon();
                    break;
                case "STAR":
                    node = figma.createStar();
                    break;
                case "VECTOR":
                    node = figma.createVector();
                    break;
                case "COMPONENT":
                    node = figma.createComponent();
                    break;
                case "SECTION":
                    node = figma.createSection();
                    break;
                case "TEXT": {
                    const textNode = figma.createText();
                    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
                    if (fontName) {
                        await figma.loadFontAsync(fontName);
                        textNode.fontName = fontName;
                    }
                    if (textContent)
                        textNode.characters = textContent;
                    node = textNode;
                    break;
                }
                default:
                    replyError("CREATE_RESULT", `지원하지 않는 노드 타입: ${nodeType}`);
                    return;
            }
            if (properties)
                applyProperties(node, properties);
            if (parentId) {
                const parent = await figma.getNodeByIdAsync(parentId);
                if (parent && "appendChild" in parent) {
                    parent.appendChild(node);
                }
            }
            reply("CREATE_RESULT", {
                error: null,
                nodeId: node.id,
                name: node.name,
                type: node.type,
            });
        }
        catch (err) {
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
                const textNode = node;
                if (fontName) {
                    await figma.loadFontAsync(fontName);
                }
                else {
                    await loadFontsForTextNode(textNode);
                }
                textNode.characters = textContent;
                if (fontName)
                    textNode.fontName = fontName;
            }
            if (properties && node.type !== "DOCUMENT" && node.type !== "PAGE") {
                applyProperties(node, properties);
            }
            reply("MODIFY_RESULT", { error: null, nodeId: node.id, name: node.name });
        }
        catch (err) {
            replyError("MODIFY_RESULT", String(err));
        }
    }
    // ===================================================================
    // WRITE: Delete nodes
    // ===================================================================
    else if (type === "DELETE_NODES") {
        try {
            const { nodeIds } = msg.payload;
            const deleted = [];
            const notFound = [];
            for (const id of nodeIds) {
                const node = await figma.getNodeByIdAsync(id);
                if (node && node.type !== "DOCUMENT" && node.type !== "PAGE") {
                    node.remove();
                    deleted.push(id);
                }
                else {
                    notFound.push(id);
                }
            }
            reply("DELETE_RESULT", { error: null, deleted, notFound });
        }
        catch (err) {
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
            const exportSettings = { format: fmt };
            if (fmt === "PNG" || fmt === "JPG") {
                exportSettings.constraint = { type: "SCALE", value: scale || 1 };
            }
            const bytes = await node.exportAsync(exportSettings);
            if (fmt === "SVG") {
                let svgStr = "";
                for (let i = 0; i < bytes.length; i++)
                    svgStr += String.fromCharCode(bytes[i]);
                reply("EXPORT_RESULT", { error: null, format: "SVG", data: svgStr });
            }
            else {
                reply("EXPORT_RESULT", { error: null, format: fmt, data: uint8ToBase64(bytes), encoding: "base64" });
            }
        }
        catch (err) {
            replyError("EXPORT_RESULT", String(err));
        }
    }
    // ===================================================================
    // UNIVERSAL: Run arbitrary Figma Plugin API code
    // ===================================================================
    else if (type === "RUN_CODE") {
        try {
            const { code } = msg.payload;
            const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
            const fn = new AsyncFunction("figma", code);
            const result = await fn(figma);
            reply("CODE_RESULT", { error: null, result: safeSerialize(result) });
        }
        catch (err) {
            replyError("CODE_RESULT", String(err));
        }
    }
};
