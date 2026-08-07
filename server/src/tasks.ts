import Database from "better-sqlite3";
import path from "node:path";
import type { FastifyInstance } from "fastify";
import { WORKSPACE_ROOT } from "./config.js";

export interface Task {
  id: number;
  title: string;
  status: "pending" | "done";
  created_at: string;
}

let db: Database.Database;

export function initTasksDb(): void {
  const dbPath = path.join(WORKSPACE_ROOT, ".workspace-tasks.db");
  db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

export function registerTaskRoutes(app: FastifyInstance): void {
  app.get("/api/tasks", async () => {
    const rows = db.prepare("SELECT * FROM tasks ORDER BY id DESC").all() as Task[];
    return rows;
  });

  app.post("/api/tasks", async (request, reply) => {
    const body = request.body as { title?: string };
    if (!body.title?.trim()) {
      return reply.code(400).send({ error: "title required" });
    }
    const result = db
      .prepare("INSERT INTO tasks (title) VALUES (?)")
      .run(body.title.trim());
    const task = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(result.lastInsertRowid) as Task;
    return task;
  });

  app.patch("/api/tasks/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { title?: string; status?: string };
    const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as Task | undefined;
    if (!existing) {
      return reply.code(404).send({ error: "Not found" });
    }
    const title = body.title ?? existing.title;
    const status = body.status ?? existing.status;
    if (status !== "pending" && status !== "done") {
      return reply.code(400).send({ error: "invalid status" });
    }
    db.prepare("UPDATE tasks SET title = ?, status = ? WHERE id = ?").run(title, status, id);
    return db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as Task;
  });

  app.delete("/api/tasks/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
    if (result.changes === 0) {
      return reply.code(404).send({ error: "Not found" });
    }
    return { ok: true };
  });
}
