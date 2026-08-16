import { useState, type FormEvent } from "react";
import type { TaskPriority, TaskStatus } from "../types/task";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "../constants/taskOptions";
import styles from "./TaskFormModal.module.css";

export interface TaskFormValues {
  title: string;
  priority: TaskPriority;
  dueDate: string | null;
  status: TaskStatus;
}

interface TaskFormModalProps {
  mode: "create" | "edit";
  initialValues?: TaskFormValues;
  onCancel: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
}

export function TaskFormModal({ mode, initialValues, onCancel, onSubmit }: TaskFormModalProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [priority, setPriority] = useState<TaskPriority>(initialValues?.priority ?? "MEDIUM");
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? "");
  const [status, setStatus] = useState<TaskStatus>(initialValues?.status ?? "TODO");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const heading = mode === "create" ? "タスクを作成" : "タスクを編集";
  const submitLabel = mode === "create" ? "登録" : "保存";

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
      setError(
        err instanceof Error
          ? err.message
          : mode === "create"
            ? "タスクの登録に失敗しました"
            : "タスクの更新に失敗しました",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-heading"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="task-form-heading" className={styles.heading}>
          {heading}
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
                value={dueDate ?? ""}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>
          </div>
          {mode === "create" && (
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
          )}
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button type="button" onClick={onCancel} disabled={isSubmitting}>
              キャンセル
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "処理中..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
