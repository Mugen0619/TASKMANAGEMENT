import type { Task, TaskPriority, TaskStatus } from "../types/task";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/tasks`);
  if (!response.ok) {
    throw new Error(`タスクの取得に失敗しました: ${response.status}`);
  }
  return response.json();
}

// バックエンド (TaskRequest.java) が受け取るリクエストボディの形に合わせる
export interface CreateTaskInput {
  title: string;
  priority: TaskPriority;
  dueDate: string | null;
  status: TaskStatus;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(`タスクの作成に失敗しました: ${response.status}`);
  }
  return response.json();
}

// PUT /api/tasks/{id} はタイトル・優先度・期限日のみを更新し、状態は変更しない
export interface UpdateTaskInput {
  title: string;
  priority: TaskPriority;
  dueDate: string | null;
}

export async function updateTask(id: number, input: UpdateTaskInput): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(`タスクの更新に失敗しました: ${response.status}`);
  }
  return response.json();
}

export async function updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error(`状態の更新に失敗しました: ${response.status}`);
  }
  return response.json();
}

export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`タスクの削除に失敗しました: ${response.status}`);
  }
}

// taskIdsは、同一状態（列）内での新しい表示順（先頭から順）
export async function reorderTasks(status: TaskStatus, taskIds: number[]): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/tasks/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, taskIds }),
  });
  if (!response.ok) {
    throw new Error(`並べ替えに失敗しました: ${response.status}`);
  }
  return response.json();
}
