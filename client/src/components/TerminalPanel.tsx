import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "@xterm/addon-fit";
import { getToken } from "../api";

export function TerminalPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: "JetBrains Mono, Consolas, monospace",
      fontSize: 13,
      theme: {
        background: "#1e1e2e",
        foreground: "#e8e8f0",
        cursor: "#7c9eff",
      },
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();
    termRef.current = term;

    const token = getToken();
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost =
      import.meta.env.DEV
        ? `${wsProtocol}//127.0.0.1:3000`
        : `${wsProtocol}//${window.location.host}`;
    const wsUrl = `${wsHost}/ws/terminal${token ? `?token=${encodeURIComponent(token)}` : ""}`;

    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    let disposed = false;

    function connect() {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        reconnectAttempts = 0;
        term.writeln("\r\n\x1b[32m已连接到工作区终端\x1b[0m");
        fitAddon.fit();
        if (term.cols && term.rows) {
          ws?.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
        }
      };
      ws.onmessage = (e) => term.write(e.data);
      ws.onclose = () => {
        if (!disposed && reconnectAttempts < 3) {
          reconnectAttempts++;
          term.writeln(`\r\n\x1b[33m连接断开，正在重连 (${reconnectAttempts}/3)...\x1b[0m`);
          setTimeout(connect, 1500);
        }
      };
      ws.onerror = () => ws?.close();
    }

    connect();

    const dataHandler = term.onData((data) => {
      if (ws?.readyState === WebSocket.OPEN) ws.send(data);
    });

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      if (ws?.readyState === WebSocket.OPEN && term.cols && term.rows) {
        ws.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      disposed = true;
      dataHandler.dispose();
      resizeObserver.disconnect();
      ws?.close();
      term.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", padding: 4 }} />
  );
}
