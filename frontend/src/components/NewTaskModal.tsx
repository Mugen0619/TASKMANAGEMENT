import { useState, type FormEvent } from "react";
import type { CreateTaskInput } from "../api/tasks";
import type { TaskPriority, TaskStatus } from "../types/task";
import styles from "./NewTaskModal.module.css";

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "HIGH", label: "高" },
  { value: "MEDIUM", label: "中" },
  { value: "LOW", label: "低" },
];

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: "未着手" },
  { value: "DOING", label: "作業中" },
  { value: "DONE", label: "完了" },
];

interface NewTaskModalProps {
  onCancel: () => void;
  onSubmit: (input: CreateTaskInput) => Promise<void>;
}

export function NewTaskModal({ onCancel, onSubmit }: NewTaskModalProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0 || trimmedTitle.length > 100) {
      setError("タイトルは1文字以上100文字以内で入力してください");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: trimmedTitle,
        priority,
        dueDate: dueDate === "" ? null : dueDate,
        status,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "タスクの登録に失敗しました");
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-task-heading"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="new-task-heading" className={styles.heading}>
          タスクを作成
        </h2>
        <form onSubmit={handleSubmit}>
          <label className={styles.field}>
            タイトル
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              autoFocus
            />
          </label>
          <div className={styles.row}>
            <label className={styles.field}>
              優先度
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as TaskPriority)}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              期限日
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>
          </div>
          <label className={styles.field}>
            状態
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button type="button" onClick={onCancel} disabled={isSubmitting}>
              キャンセル
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "登録中..." : "登録"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
