import type { Task } from "../types/task";
import styles from "./TaskCard.module.css";

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  HIGH: "🔴 高",
  MEDIUM: "🟡 中",
  LOW: "🟢 低",
};

const STATUS_LABEL: Record<Task["status"], string> = {
  TODO: "未着手",
  DOING: "作業中",
  DONE: "完了",
};

function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === "DONE") {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(task.dueDate) < today;
}

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const overdue = isOverdue(task);

  return (
    <div className={`${styles.card} ${styles[task.priority.toLowerCase()]}`}>
      <p className={styles.title}>
        {PRIORITY_LABEL[task.priority]} {task.title}
      </p>
      <p className={overdue ? styles.dueDateOverdue : styles.dueDate}>
        期限: {task.dueDate ?? "未設定"}
      </p>
      <p className={styles.status}>状態: {STATUS_LABEL[task.status]}</p>
    </div>
  );
}
