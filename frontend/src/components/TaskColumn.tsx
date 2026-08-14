import type { Task } from "../types/task";
import { TaskCard } from "./TaskCard";
import styles from "./TaskColumn.module.css";

interface TaskColumnProps {
  title: string;
  tasks: Task[];
}

export function TaskColumn({ title, tasks }: TaskColumnProps) {
  return (
    <div className={styles.column}>
      <h2 className={styles.heading}>
        {title} ({tasks.length})
      </h2>
      <div className={styles.cardList}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
