import path from "node:path";
import fs from "node:fs";

export const WORKSPACE_ROOT = path.resolve(
  process.env.WORKSPACE_ROOT ?? process.cwd(),
);

export const ACCESS_TOKEN = process.env.ACCESS_TOKEN ?? "";
export const HOST = process.env.HOST ?? "127.0.0.1";
export const PORT = Number(process.env.PORT ?? 3000);

export function resolveSafePath(relPath: string): string {
  const normalized = path.normalize(relPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const full = path.resolve(WORKSPACE_ROOT, normalized);
  if (!full.startsWith(WORKSPACE_ROOT)) {
    throw new Error("Path outside workspace");
  }
  return full;
}

export function toRelativePath(fullPath: string): string {
  return path.relative(WORKSPACE_ROOT, fullPath).replace(/\\/g, "/");
}

export function ensureWorkspaceExists(): void {
  if (!fs.existsSync(WORKSPACE_ROOT)) {
    fs.mkdirSync(WORKSPACE_ROOT, { recursive: true });
  }
}
