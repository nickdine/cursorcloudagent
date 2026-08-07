const TOKEN_KEY = "workspace_access_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function authHeaders(): HeadersInit {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export interface FileEntry {
  name: string;
  path: string;
  type: "file" | "directory";
}

export interface FileListResponse {
  path: string;
  type: "directory";
  entries: FileEntry[];
}

export interface FileContentResponse {
  path: string;
  type: "file";
  content: string;
}

export interface Task {
  id: number;
  title: string;
  status: "pending" | "done";
  created_at: string;
}

export interface WorkspaceInfo {
  root: string;
  name: string;
}
