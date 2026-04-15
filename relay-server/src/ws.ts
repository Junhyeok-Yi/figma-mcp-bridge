import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";

export const WS_PORT = parseInt(process.env.WS_PORT || "8080", 10);
export const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || "30000", 10);
export const CODE_TIMEOUT_MS = parseInt(process.env.CODE_TIMEOUT_MS || "60000", 10);

const PING_INTERVAL_MS = 15_000;

let figmaClient: WebSocket | null = null;
const pendingRequests = new Map<
  string,
  { resolve: (data: unknown) => void; reject: (err: Error) => void; timer: ReturnType<typeof setTimeout> }
>();

export function log(msg: string) {
  process.stderr.write(`[relay] ${msg}\n`);
}

export function isConnected(): boolean {
  return figmaClient !== null && figmaClient.readyState === WebSocket.OPEN;
}

export function startWebSocketServer(): WebSocketServer {
  const wss = new WebSocketServer({ port: WS_PORT });

  wss.on("listening", () => {
    log(`WebSocket server listening on ws://localhost:${WS_PORT}`);
  });

  wss.on("connection", (ws) => {
    if (figmaClient && figmaClient !== ws && figmaClient.readyState !== WebSocket.CLOSED) {
      log("Terminating previous zombie connection");
      figmaClient.terminate();
    }
    figmaClient = ws;
    log("Figma plugin connected");

    let isAlive = true;
    ws.on("pong", () => { isAlive = true; });

    const pingTimer = setInterval(() => {
      if (!isAlive) {
        log("Pong timeout — terminating dead connection");
        clearInterval(pingTimer);
        ws.terminate();
        return;
      }
      isAlive = false;
      ws.ping();
    }, PING_INTERVAL_MS);

    ws.on("message", (raw) => {
      let msg: { messageId?: string; type?: string; payload?: unknown };
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        log(`Invalid JSON from Figma: ${raw.toString().slice(0, 200)}`);
        return;
      }

      if (msg.type === "HEARTBEAT") {
        ws.send(JSON.stringify({ type: "HEARTBEAT_ACK" }));
        return;
      }

      if (msg.messageId && pendingRequests.has(msg.messageId)) {
        const pending = pendingRequests.get(msg.messageId)!;
        clearTimeout(pending.timer);
        pendingRequests.delete(msg.messageId);

        if (msg.type === "ERROR") {
          pending.reject(new Error(String(msg.payload ?? "Unknown Figma error")));
        } else {
          pending.resolve(msg.payload);
        }
      } else {
        log(`Unmatched message from Figma: ${JSON.stringify(msg).slice(0, 300)}`);
      }
    });

    ws.on("close", () => {
      clearInterval(pingTimer);
      log("Figma plugin disconnected");
      if (figmaClient === ws) figmaClient = null;
    });

    ws.on("error", (err) => {
      clearInterval(pingTimer);
      log(`WebSocket error: ${err.message}`);
    });
  });

  return wss;
}

export function sendToFigma(type: string, payload?: unknown, timeoutMs?: number): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (!figmaClient || figmaClient.readyState !== WebSocket.OPEN) {
      return reject(
        new Error("Figma plugin not connected. Run the plugin in Figma and click Connect.")
      );
    }

    const messageId = randomUUID();
    const timeout = timeoutMs ?? REQUEST_TIMEOUT_MS;

    const timer = setTimeout(() => {
      pendingRequests.delete(messageId);
      reject(new Error(`Figma response timeout (${timeout}ms). Check plugin status.`));
    }, timeout);

    pendingRequests.set(messageId, { resolve, reject, timer });
    figmaClient.send(JSON.stringify({ messageId, type, payload }));
  });
}
