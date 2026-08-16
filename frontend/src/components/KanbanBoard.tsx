import type { Task, TaskStatus } from "../types/task";
import { TaskColumn } from "./TaskColumn";
import styles from "./KanbanBoard.module.css";

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: "TODO", title: "未着手" },
  { status: "DOING", title: "作業中" },
  { status: "DONE", title: "完了" },
];

interface KanbanBoardProps {
  tasks: Task[];
}

export function KanbanBoard({ tasks }: KanbanBoardProps) {
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
