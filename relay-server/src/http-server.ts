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

// ===== Batch =====
app.post("/api/batch", async (req, res) => {
  const { operations } = req.body;
  if (!Array.isArray(operations)) {
    res.status(400).json({ error: "operations must be an array" });
    return;
  }

  const results: unknown[] = [];
  for (const op of operations) {
    try {
      const timeout = op.type === "RUN_CODE" ? CODE_TIMEOUT_MS : undefined;
      const result = await sendToFigma(op.type, op.payload, timeout);
      results.push({ ok: true, data: result });
    } catch (err: any) {
      results.push({ ok: false, error: err.message });
      if (op.stopOnError) break;
    }
  }
  res.json({ results });
});

app.listen(HTTP_PORT, () => {
  log(`HTTP API running on http://localhost:${HTTP_PORT}`);
  log("Ready to receive requests from CLI / Cline.");
});
