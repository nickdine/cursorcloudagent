import { useEffect, useState } from "react";
import { api, type Task } from "../api";

export function TaskPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function loadTasks() {
    try {
      const data = await api<Task[]>("/api/tasks");
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function addTask() {
    if (!newTitle.trim()) return;
    try {
      await api<Task>("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      setNewTitle("");
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加失败");
    }
  }

  async function toggleTask(task: Task) {
    const status = task.status === "done" ? "pending" : "done";
    try {
      await api<Task>(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败");
    }
  }

  async function deleteTask(id: number) {
    try {
      await api(`/api/tasks/${id}`, { method: "DELETE" });
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    }
  }

  return (
    <div className="panel-body" style={{ padding: 8 }}>
      {error && (
        <div style={{ color: "var(--danger)", fontSize: 12, marginBottom: 8 }}>{error}</div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          type="text"
          placeholder="新任务..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          style={{ flex: 1 }}
        />
        <button type="button" className="primary" onClick={addTask}>添加</button>
      </div>
      {tasks.length === 0 ? (
        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>暂无任务</div>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className={`task-item${task.status === "done" ? " done" : ""}`}>
            <input
              type="checkbox"
              checked={task.status === "done"}
              onChange={() => toggleTask(task)}
            />
            <span style={{ flex: 1 }}>{task.title}</span>
            <button type="button" onClick={() => deleteTask(task.id)}>删除</button>
          </div>
        ))
      )}
    </div>
  );
}
