import os from "node:os";
import type { FastifyInstance } from "fastify";
import type { WebSocket } from "@fastify/websocket";
import * as pty from "node-pty";
import { WORKSPACE_ROOT } from "./config.js";

export function registerTerminalRoutes(app: FastifyInstance): void {
  app.get("/ws/terminal", { websocket: true }, (socket: WebSocket) => {
    const shell = process.env.SHELL ?? "/bin/bash";
    const ptyProcess = pty.spawn(shell, [], {
      name: "xterm-color",
      cols: 80,
      rows: 24,
      cwd: WORKSPACE_ROOT,
      env: process.env as Record<string, string>,
    });

    ptyProcess.onData((data) => {
      if (socket.readyState === socket.OPEN) {
        socket.send(data);
      }
    });

    socket.on("message", (raw: Buffer | ArrayBuffer | Buffer[]) => {
      const data = typeof raw === "string" ? raw : Buffer.from(raw as Buffer).toString();
      if (data.startsWith("{")) {
        try {
          const msg = JSON.parse(data) as { type?: string; cols?: number; rows?: number };
          if (msg.type === "resize" && msg.cols && msg.rows) {
            ptyProcess.resize(msg.cols, msg.rows);
            return;
          }
        } catch {
          // fall through
        }
      }
      ptyProcess.write(data);
    });

    socket.on("close", () => {
      ptyProcess.kill();
    });
  });
}
