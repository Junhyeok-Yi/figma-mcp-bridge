import express from "express";
import { startWebSocketServer, sendToFigma, isConnected, log, CODE_TIMEOUT_MS } from "./ws.js";

startWebSocketServer();

const HTTP_PORT = parseInt(process.env.HTTP_PORT || "3000", 10);
const app = express();
app.use(express.json({ limit: "10mb" }));

async function handle(
  res: express.Response,
  type: string,
  payload?: unknown,
  timeoutMs?: number,
) {
  try {
    const result = await sendToFigma(type, payload, timeoutMs);
    res.json(result);
  } catch (err: any) {
    const status = err.message.includes("not connected") ? 502 : 500;
    res.status(status).json({ error: err.message });
  }
}

// ===== Status =====
app.get("/api/status", (_req, res) => {
  res.json({ connected: isConnected() });
});

// ===== Read =====
function readOpts(query: Record<string, any>) {
  const compact = query.verbose !== "1" && query.verbose !== "true";
  const depth = query.depth ? parseInt(query.depth as string, 10) : undefined;
  return { compact, depth };
}

app.get("/api/selection", (req, res) => {
  handle(res, "GET_SELECTION", readOpts(req.query));
});
app.get("/api/styles", (_req, res) => handle(res, "GET_STYLES"));
app.get("/api/components", (_req, res) => handle(res, "GET_COMPONENTS"));
app.get("/api/node/:id", (req, res) => {
  handle(res, "GET_NODE_BY_ID", { nodeId: req.params.id, ...readOpts(req.query) });
});

// ===== Write =====
app.post("/api/create_node", (req, res) => handle(res, "CREATE_NODE", req.body));
app.post("/api/modify_node", (req, res) => handle(res, "MODIFY_NODE", req.body));
app.post("/api/delete_nodes", (req, res) => handle(res, "DELETE_NODES", req.body));
app.post("/api/export_node", (req, res) => handle(res, "EXPORT_NODE", req.body));

// ===== Universal =====
app.post("/api/run_code", (req, res) => {
  handle(res, "RUN_CODE", req.body, CODE_TIMEOUT_MS);
});

// ===== Batch (with $ref variable substitution) =====

function resolveRefs(obj: unknown, refs: Map<string, unknown>): unknown {
  if (typeof obj === "string") {
    if (obj.startsWith("$") && !obj.includes(" ")) {
      const parts = obj.slice(1).split(".");
      let val: any = refs.get(parts[0]);
      for (let i = 1; i < parts.length && val != null; i++) val = val[parts[i]];
      return val;
    }
    return obj.replace(/\$(\w+(?:\.\w+)+)/g, (match, refPath) => {
      const parts = refPath.split(".");
      let val: any = refs.get(parts[0]);
      for (let i = 1; i < parts.length && val != null; i++) val = val[parts[i]];
      return val != null ? String(val) : match;
    });
  }
  if (Array.isArray(obj)) return obj.map(v => resolveRefs(v, refs));
  if (obj && typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      out[k] = resolveRefs(v, refs);
    }
    return out;
  }
  return obj;
}

app.post("/api/batch", async (req, res) => {
  const { operations } = req.body;
  if (!Array.isArray(operations)) {
    res.status(400).json({ error: "operations must be an array" });
    return;
  }

  const refs = new Map<string, unknown>();
  const results: unknown[] = [];

  for (const op of operations) {
    try {
      const payload = resolveRefs(op.payload, refs);
      const timeout = op.type === "RUN_CODE" ? CODE_TIMEOUT_MS : undefined;
      const result = await sendToFigma(op.type, payload, timeout);
      if (op.ref) refs.set(op.ref, result);
      results.push({ ok: true, ref: op.ref || null, data: result });
    } catch (err: any) {
      results.push({ ok: false, ref: op.ref || null, error: err.message });
      if (op.stopOnError) break;
    }
  }
  res.json({ results });
});

app.listen(HTTP_PORT, () => {
  log(`HTTP API running on http://localhost:${HTTP_PORT}`);
  log("Ready to receive requests from CLI / Cline.");
});
