import { useEffect, useState } from "react";
import { fetchTasks } from "../api/tasks";
import type { Task, TaskStatus } from "../types/task";
import { TaskColumn } from "./TaskColumn";
import styles from "./KanbanBoard.module.css";

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: "TODO", title: "未着手" },
  { status: "DOING", title: "作業中" },
  { status: "DONE", title: "完了" },
];

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <p className={styles.message}>読み込み中...</p>;
  }

  if (error) {
    return <p className={styles.message}>エラー: {error}</p>;
  }

  return (
    <div className={styles.board}>
      {COLUMNS.map(({ status, title }) => (
        <TaskColumn
          key={status}
          title={title}
          tasks={tasks.filter((task) => task.status === status)}
        />
      ))}
    </div>
  );
}
