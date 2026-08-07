import fs from "node:fs";
import path from "node:path";
import type { FastifyInstance } from "fastify";
import { WORKSPACE_ROOT, resolveSafePath, toRelativePath } from "./config.js";

interface FileEntry {
  name: string;
  path: string;
  type: "file" | "directory";
}

function listDirectory(dirPath: string): FileEntry[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries
    .filter((e) => !e.name.startsWith("."))
    .map((e) => ({
      name: e.name,
      path: toRelativePath(path.join(dirPath, e.name)),
      type: (e.isDirectory() ? "directory" : "file") as FileEntry["type"],
    }))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

export function registerFileRoutes(app: FastifyInstance): void {
  app.get("/api/files", async (request, reply) => {
    const rel = (request.query as { path?: string }).path ?? "";
    try {
      const full = resolveSafePath(rel);
      if (!fs.existsSync(full)) {
        return reply.code(404).send({ error: "Not found" });
      }
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        return { path: rel, type: "directory", entries: listDirectory(full) };
      }
      const content = fs.readFileSync(full, "utf-8");
      return { path: rel, type: "file", content };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid path";
      return reply.code(400).send({ error: message });
    }
  });

  app.put("/api/files", async (request, reply) => {
    const body = request.body as { path?: string; content?: string };
    if (!body.path || body.content === undefined) {
      return reply.code(400).send({ error: "path and content required" });
    }
    try {
      const full = resolveSafePath(body.path);
      const dir = path.dirname(full);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(full, body.content, "utf-8");
      return { ok: true, path: body.path };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Write failed";
      return reply.code(400).send({ error: message });
    }
  });

  app.delete("/api/files", async (request, reply) => {
    const rel = (request.query as { path?: string }).path;
    if (!rel) {
      return reply.code(400).send({ error: "path required" });
    }
    try {
      const full = resolveSafePath(rel);
      if (!fs.existsSync(full)) {
        return reply.code(404).send({ error: "Not found" });
      }
      fs.rmSync(full, { recursive: true });
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      return reply.code(400).send({ error: message });
    }
  });

  app.get("/api/workspace", async () => ({
    root: WORKSPACE_ROOT,
    name: path.basename(WORKSPACE_ROOT),
  }));
}
