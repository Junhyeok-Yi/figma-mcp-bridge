import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";

export const WS_PORT = parseInt(process.env.WS_PORT || "8080", 10);
export const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || "30000", 10);
export const CODE_TIMEOUT_MS = parseInt(process.env.CODE_TIMEOUT_MS || "60000", 10);

/** 0 = 비활성화. 임베디드(WebView) 클라이언트와 ping/pong 호환 문제 시 끄고 테스트. */
const PING_INTERVAL_MS = parseInt(process.env.RELAY_WS_PING_MS ?? "15000", 10);

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

  wss.on("connection", (ws, req) => {
    const peer = req.socket.remoteAddress ?? "?";
    const existingOpen =
      figmaClient &&
      (figmaClient.readyState === WebSocket.OPEN ||
        figmaClient.readyState === WebSocket.CONNECTING);

    if (existingOpen) {
      log(
        `Rejecting extra Figma connection (${peer}) — relay already has an active client. Close other plugin windows or disconnect there.`
      );
      try {
        ws.close(1008, "relay already has a connected client");
      } catch {
        ws.terminate();
      }
      return;
    }

    if (figmaClient && figmaClient !== ws && figmaClient.readyState !== WebSocket.CLOSED) {
      log(`Replacing stale socket (${peer})`);
      try {
        figmaClient.close(1000, "replaced by new connection");
      } catch {
        figmaClient.terminate();
      }
    }
    figmaClient = ws;
    log(`Figma plugin connected (${peer})`);

    let isAlive = true;
    let pongMissStreak = 0;
    ws.on("pong", () => {
      isAlive = true;
      pongMissStreak = 0;
    });

    let pingTimer: ReturnType<typeof setInterval> | null = null;
    if (PING_INTERVAL_MS > 0) {
      pingTimer = setInterval(() => {
        if (!isAlive) {
          pongMissStreak++;
          if (pongMissStreak >= 2) {
            log("Pong timeout (2 intervals) — closing connection");
            if (pingTimer) clearInterval(pingTimer);
            ws.terminate();
            return;
          }
        } else {
          pongMissStreak = 0;
        }
        isAlive = false;
        try {
          ws.ping();
        } catch {
          if (pingTimer) clearInterval(pingTimer);
        }
      }, PING_INTERVAL_MS);
    }

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
      if (pingTimer) clearInterval(pingTimer);
      log("Figma plugin disconnected");
      if (figmaClient === ws) figmaClient = null;
    });

    ws.on("error", (err) => {
      if (pingTimer) clearInterval(pingTimer);
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
