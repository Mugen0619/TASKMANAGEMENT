import type { Task, TaskStatus } from "../types/task";
import { STATUS_OPTIONS } from "../constants/taskOptions";
import styles from "./TaskCard.module.css";

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  HIGH: "🔴 高",
  MEDIUM: "🟡 中",
  LOW: "🟢 低",
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
  onStatusChange: (id: number, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onStatusChange, onEdit }: TaskCardProps) {
  const overdue = isOverdue(task);

  return (
    <div className={`${styles.card} ${styles[task.priority.toLowerCase()]}`}>
      <p className={styles.title}>
        {PRIORITY_LABEL[task.priority]} {task.title}
      </p>
      <p className={overdue ? styles.dueDateOverdue : styles.dueDate}>
        期限: {task.dueDate ?? "未設定"}
      </p>
      <div className={styles.controls}>
        <label className={styles.statusControl}>
          状態:
          <select
            value={task.status}
            onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className={styles.editButton} onClick={() => onEdit(task)}>
          ✎ 編集
        </button>
      </div>
    </div>
  );
}
