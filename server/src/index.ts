import path from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import fastifyStatic from "@fastify/static";
import { HOST, PORT, ensureWorkspaceExists } from "./config.js";
import { authHook } from "./auth.js";
import { registerFileRoutes } from "./files.js";
import { initTasksDb, registerTaskRoutes } from "./tasks.js";
import { registerTerminalRoutes } from "./terminal.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, "../../client/dist");

async function main() {
  ensureWorkspaceExists();
  initTasksDb();

  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await app.register(websocket);

  app.addHook("onRequest", authHook);

  registerFileRoutes(app);
  registerTaskRoutes(app);
  registerTerminalRoutes(app);

  const serveClient =
    process.env.NODE_ENV === "production" || process.env.SERVE_CLIENT === "1";
  if (serveClient) {
    await app.register(fastifyStatic, {
      root: clientDist,
      prefix: "/",
    });
    app.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith("/api") || request.url.startsWith("/ws")) {
        reply.code(404).send({ error: "Not found" });
        return;
      }
      reply.sendFile("index.html");
    });
  }

  await app.listen({ host: HOST, port: PORT });
  console.log(`Workspace server at http://${HOST}:${PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
