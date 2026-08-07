import { useCallback, useEffect, useState } from "react";
import {
  api,
  type FileEntry,
  type FileListResponse,
  type FileContentResponse,
} from "../api";

interface FileTreeProps {
  onSelectFile: (path: string, content: string) => void;
}

export function FileTree({ onSelectFile }: FileTreeProps) {
  const [currentPath, setCurrentPath] = useState("");
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDir = useCallback(async (path: string) => {
    try {
      const data = await api<FileListResponse>(
        `/api/files?path=${encodeURIComponent(path)}`,
      );
      setEntries(data.entries);
      setCurrentPath(path);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }, []);

  useEffect(() => {
    loadDir("");
  }, [loadDir]);

  async function handleClick(entry: FileEntry) {
    setSelected(entry.path);
    if (entry.type === "directory") {
      await loadDir(entry.path);
    } else {
      try {
        const data = await api<FileContentResponse>(
          `/api/files?path=${encodeURIComponent(entry.path)}`,
        );
        onSelectFile(data.path, data.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : "读取失败");
      }
    }
  }

  function goUp() {
    if (!currentPath) return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    loadDir(parts.join("/"));
  }

  const breadcrumbs = currentPath ? currentPath.split("/") : [];

  return (
    <div className="panel-body" style={{ padding: 4 }}>
      <div style={{ display: "flex", gap: 4, padding: "4px 4px 8px", fontSize: 12, flexWrap: "wrap" }}>
        <button type="button" onClick={() => loadDir("")}>根目录</button>
        {breadcrumbs.map((part, i) => {
          const path = breadcrumbs.slice(0, i + 1).join("/");
          return (
            <button key={path} type="button" onClick={() => loadDir(path)}>
              / {part}
            </button>
          );
        })}
        {currentPath && (
          <button type="button" onClick={goUp}>↑ 上级</button>
        )}
      </div>
      {error && (
        <div style={{ color: "var(--danger)", fontSize: 12, padding: 4 }}>{error}</div>
      )}
      {entries.length === 0 ? (
        <div style={{ color: "var(--text-muted)", fontSize: 13, padding: 8 }}>空目录</div>
      ) : (
        entries.map((entry) => (
          <div
            key={entry.path}
            className={`file-tree-item${selected === entry.path ? " selected" : ""}`}
            onClick={() => handleClick(entry)}
          >
            <span>{entry.type === "directory" ? "📁" : "📄"}</span>
            <span>{entry.name}</span>
          </div>
        ))
      )}
    </div>
  );
}
