// バックエンド (TaskStatus.java / TaskPriority.java) のenum名にそのまま合わせる（大文字）
export type TaskStatus = "TODO" | "DOING" | "DONE";
export type TaskPriority = "HIGH" | "MEDIUM" | "LOW";

// バックエンド (Task.java) が返すJSONの形に合わせる
export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null; // "YYYY-MM-DD" 形式、未設定はnull
  createdAt: string; // ISO 8601形式の日時文字列
  sortOrder: number; // 同一状態（列）内での表示順。値が小さいほど先頭
}
