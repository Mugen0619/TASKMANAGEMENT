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
