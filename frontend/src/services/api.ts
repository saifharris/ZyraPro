import { ActionCenterData, Task, TaskStatus } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message ?? `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  getActionCenter: (studentId: string): Promise<ActionCenterData> =>
    request<ActionCenterData>(`/students/${studentId}/action-center`),

  updateTaskStatus: (taskId: string, status: TaskStatus): Promise<Task> =>
    request<Task>(`/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
