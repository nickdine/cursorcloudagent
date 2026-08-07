import { useState } from "react";
import { api } from "../api";

interface FileEditorProps {
  path: string | null;
  content: string;
  onChange: (content: string) => void;
  onSaved: () => void;
}

export function FileEditor({ path, content, onChange, onSaved }: FileEditorProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    if (!path) return;
    setSaving(true);
    setMessage(null);
    try {
      await api("/api/files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, content }),
      });
      setMessage("已保存");
      onSaved();
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (!path) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "var(--text-muted)",
          fontSize: 14,
        }}
      >
        从左侧文件树选择文件进行编辑
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 12px",
          borderBottom: "1px solid var(--border)",
          fontSize: 12,
        }}
      >
        <span>{path}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {message && <span style={{ color: "var(--success)", fontSize: 12 }}>{message}</span>}
          <button type="button" className="primary" onClick={save} disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
      <textarea
        className="editor-area"
        value={content}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
