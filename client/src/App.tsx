import { useEffect, useState } from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { api, getToken, setToken, type WorkspaceInfo } from "./api";
import { CameraPanel } from "./components/CameraPanel";
import { FileTree } from "./components/FileTree";
import { FileEditor } from "./components/FileEditor";
import { TerminalPanel } from "./components/TerminalPanel";
import { TaskPanel } from "./components/TaskPanel";

type MainTab = "terminal" | "editor";

export default function App() {
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>("terminal");
  const [filePath, setFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [tokenInput, setTokenInput] = useState(getToken() ?? "");
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    api<WorkspaceInfo>("/api/workspace")
      .then(setWorkspace)
      .catch(() => setWorkspace({ root: "", name: "工作区" }));
  }, []);

  function handleSelectFile(path: string, content: string) {
    setFilePath(path);
    setFileContent(content);
    setMainTab("editor");
  }

  function saveToken() {
    setToken(tokenInput.trim());
    setShowToken(false);
    window.location.reload();
  }

  return (
    <div className="workspace-layout">
      <header className="app-header">
        <h1>开发工作区 — {workspace?.name ?? "加载中..."}</h1>
        <div className="header-actions">
          <button
            type="button"
            className={cameraOpen ? "primary" : ""}
            onClick={() => setCameraOpen((v) => !v)}
          >
            {cameraOpen ? "隐藏摄像头" : "摄像头"}
          </button>
          <button type="button" onClick={() => setShowToken((v) => !v)}>
            访问令牌
          </button>
        </div>
      </header>

      {showToken && (
        <div style={{ padding: "8px 16px", background: "var(--bg-panel)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="password"
              placeholder="ACCESS_TOKEN（若服务端已配置）"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="button" className="primary" onClick={saveToken}>保存并刷新</button>
          </div>
        </div>
      )}

      <div className="workspace-main">
        <PanelGroup direction="vertical" style={{ height: "100%" }}>
          <Panel defaultSize={75} minSize={30}>
            <PanelGroup direction="horizontal" style={{ height: "100%" }}>
              <Panel defaultSize={22} minSize={15} maxSize={40}>
                <div className="panel" style={{ height: "100%" }}>
                  <div className="panel-header">文件树</div>
                  <FileTree onSelectFile={handleSelectFile} />
                </div>
              </Panel>
              <PanelResizeHandle className="resize-handle" style={{ width: 4 }} />
              <Panel minSize={40}>
                <div className="panel" style={{ height: "100%" }}>
                  <div className="panel-header">
                    <div className="tab-bar" style={{ border: "none", padding: 0 }}>
                      <button
                        type="button"
                        className={`tab${mainTab === "terminal" ? " active" : ""}`}
                        onClick={() => setMainTab("terminal")}
                      >
                        终端
                      </button>
                      <button
                        type="button"
                        className={`tab${mainTab === "editor" ? " active" : ""}`}
                        onClick={() => setMainTab("editor")}
                      >
                        编辑器
                      </button>
                    </div>
                  </div>
                  <div className="panel-body">
                    {mainTab === "terminal" ? (
                      <TerminalPanel />
                    ) : (
                      <FileEditor
                        path={filePath}
                        content={fileContent}
                        onChange={setFileContent}
                        onSaved={() => {}}
                      />
                    )}
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
          <PanelResizeHandle className="resize-handle" style={{ height: 4 }} />
          <Panel defaultSize={25} minSize={15} maxSize={50}>
            <div className="panel" style={{ height: "100%" }}>
              <div className="panel-header">任务</div>
              <TaskPanel />
            </div>
          </Panel>
        </PanelGroup>
      </div>

      <CameraPanel open={cameraOpen} onClose={() => setCameraOpen(false)} />
    </div>
  );
}
