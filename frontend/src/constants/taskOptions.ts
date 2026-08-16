import type { TaskPriority, TaskStatus } from "../types/task";

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "HIGH", label: "高" },
  { value: "MEDIUM", label: "中" },
  { value: "LOW", label: "低" },
];

export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: "未着手" },
  { value: "DOING", label: "作業中" },
  { value: "DONE", label: "完了" },
];
