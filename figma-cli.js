#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.FIGMA_API || "http://localhost:3000";

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

async function api(method, urlPath, body) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${urlPath}`, opts);
  const data = await res.json();
  if (!res.ok) {
    const msg = data.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Color conversion
// ---------------------------------------------------------------------------

function hexToRgb(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length === 8) {
    return {
      r: parseInt(hex.slice(0, 2), 16) / 255,
      g: parseInt(hex.slice(2, 4), 16) / 255,
      b: parseInt(hex.slice(4, 6), 16) / 255,
      a: parseInt(hex.slice(6, 8), 16) / 255,
    };
  }
  return {
    r: parseInt(hex.slice(0, 2), 16) / 255,
    g: parseInt(hex.slice(2, 4), 16) / 255,
    b: parseInt(hex.slice(4, 6), 16) / 255,
  };
}

// ---------------------------------------------------------------------------
// Flag parser  --key value → { key: value }
// ---------------------------------------------------------------------------

function parseFlags(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith("--")) continue;
    const key = args[i].slice(2);
    const val = args[i + 1];
    flags[key] = val;
    i++;
  }
  return flags;
}

function buildNodePayload(flags) {
  const props = {};
  if (flags.name) props.name = flags.name;
  if (flags.w) props.width = Number(flags.w);
  if (flags.h) props.height = Number(flags.h);
  if (flags.x) props.x = Number(flags.x);
  if (flags.y) props.y = Number(flags.y);
  if (flags.radius) props.cornerRadius = Number(flags.radius);
  if (flags.opacity) props.opacity = Number(flags.opacity);
  if (flags.fill) {
    const c = hexToRgb(flags.fill);
    props.fills = [{ type: "SOLID", color: { r: c.r, g: c.g, b: c.b }, opacity: c.a }];
  }
  if (flags.stroke) {
    const c = hexToRgb(flags.stroke);
    props.strokes = [{ type: "SOLID", color: { r: c.r, g: c.g, b: c.b } }];
  }
  if (flags["stroke-weight"]) props.strokeWeight = Number(flags["stroke-weight"]);
  if (flags.visible) props.visible = flags.visible !== "false";
  if (flags.layout) props.layoutMode = flags.layout.toUpperCase();
  if (flags.gap) props.itemSpacing = Number(flags.gap);
  if (flags.padding) {
    const p = Number(flags.padding);
    props.paddingLeft = p;
    props.paddingRight = p;
    props.paddingTop = p;
    props.paddingBottom = p;
  }
  return props;
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

const commands = {
  async status() {
    return api("GET", "/api/status");
  },

  async selection(args) {
    const flags = parseFlags(args || []);
    const qs = flags.verbose ? "?verbose=1" : "";
    const depth = flags.depth ? `${qs ? "&" : "?"}depth=${flags.depth}` : "";
    return api("GET", `/api/selection${qs}${depth}`);
  },

  async styles() {
    return api("GET", "/api/styles");
  },

  async components() {
    return api("GET", "/api/components");
  },

  async node(args) {
    const id = args[0];
    if (!id) throw new Error("Usage: figma-cli node <nodeId>");
    const flags = parseFlags(args.slice(1));
    const qs = flags.verbose ? "?verbose=1" : "";
    const depth = flags.depth ? `${qs ? "&" : "?"}depth=${flags.depth}` : "";
    return api("GET", `/api/node/${id}${qs}${depth}`);
  },

  async create(args) {
    const nodeType = (args[0] || "").toUpperCase();
    if (!nodeType) throw new Error("Usage: figma-cli create <type> [--name ... --w ... --h ...]");
    const flags = parseFlags(args.slice(1));
    const properties = buildNodePayload(flags);
    const payload = { nodeType, properties };
    if (flags.parent) payload.parentId = flags.parent;
    if (flags.text) payload.textContent = flags.text;
    if (flags.font) {
      const parts = flags.font.split("/");
      payload.fontName = { family: parts[0], style: parts[1] || "Regular" };
    }
    return api("POST", "/api/create_node", payload);
  },

  async modify(args) {
    const nodeId = args[0];
    if (!nodeId) throw new Error("Usage: figma-cli modify <nodeId> [--name ... --w ...]");
    const flags = parseFlags(args.slice(1));
    const properties = buildNodePayload(flags);
    const payload = { nodeId, properties };
    if (flags.text) payload.textContent = flags.text;
    if (flags.font) {
      const parts = flags.font.split("/");
      payload.fontName = { family: parts[0], style: parts[1] || "Regular" };
    }
    return api("POST", "/api/modify_node", payload);
  },

  async delete(args) {
    if (args.length === 0) throw new Error("Usage: figma-cli delete <id> [<id> ...]");
    return api("POST", "/api/delete_nodes", { nodeIds: args });
  },

  async export(args) {
    const nodeId = args[0];
    if (!nodeId) throw new Error("Usage: figma-cli export <nodeId> [--format png --scale 2]");
    const flags = parseFlags(args.slice(1));
    return api("POST", "/api/export_node", {
      nodeId,
      format: (flags.format || "PNG").toUpperCase(),
      scale: flags.scale ? Number(flags.scale) : 1,
    });
  },

  async run(args) {
    const filePath = args[0];
    if (!filePath) throw new Error("Usage: figma-cli run <file.js>");
    const code = fs.readFileSync(path.resolve(filePath), "utf-8");
    return api("POST", "/api/run_code", { code });
  },

  async batch(args) {
    const filePath = args[0];
    if (!filePath) throw new Error("Usage: figma-cli batch <operations.json>");
    const raw = fs.readFileSync(path.resolve(filePath), "utf-8");
    const operations = JSON.parse(raw);
    return api("POST", "/api/batch", { operations: Array.isArray(operations) ? operations : operations.operations });
  },

  async eval(args) {
    const code = args.join(" ");
    if (!code) throw new Error("Usage: figma-cli eval <code>");
    return api("POST", "/api/run_code", { code });
  },
};

// Aliases
commands.sel = commands.selection;
commands.comps = commands.components;

// ---------------------------------------------------------------------------
// Help
// ---------------------------------------------------------------------------

function printHelp() {
  const help = `
figma-cli — Figma Bridge CLI (no JSON escaping needed)

USAGE
  node figma-cli.js <command> [args]

COMMANDS
  status                                Check Figma connection
  selection | sel                       Get selected layers
  styles                                Get local styles
  components | comps                    Get local components
  node <id>                             Get node by ID

  create <TYPE> [flags]                 Create a node
    --name  --w  --h  --x  --y  --fill "#hex"  --radius  --parent <id>
    --text "content"  --font "Family/Style"  --layout vertical  --gap  --padding

  modify <id> [flags]                   Modify a node (same flags as create)
  delete <id> [<id> ...]                Delete nodes
  export <id> [--format png --scale 2]  Export as image

  run <file.js>                         Execute Figma Plugin API code from file
  eval <code>                           Execute inline code (simple expressions)
  batch <file.json>                     Run batch operations from JSON file

ENVIRONMENT
  FIGMA_API    Base URL (default: http://localhost:3000)

EXAMPLES
  node figma-cli.js status
  node figma-cli.js selection
  node figma-cli.js create FRAME --name "Card" --w 320 --h 200 --fill "#1a1a2e"
  node figma-cli.js create TEXT --text "Hello" --font "Inter/Bold" --parent "1:23"
  node figma-cli.js run ./scripts/build-card.js
  node figma-cli.js batch ./scripts/create-grid.json
  node figma-cli.js eval "return figma.currentPage.name"
`;
  console.log(help.trim());
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const [cmd, ...args] = process.argv.slice(2);

  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
    printHelp();
    return;
  }

  const handler = commands[cmd];
  if (!handler) {
    console.error(`Unknown command: ${cmd}\n`);
    printHelp();
    process.exit(1);
  }

  const result = await handler(args);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
