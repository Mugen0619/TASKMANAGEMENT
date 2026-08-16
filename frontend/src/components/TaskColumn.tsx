import type { Task, TaskStatus } from "../types/task";
import { TaskCard } from "./TaskCard";
import styles from "./TaskColumn.module.css";

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onStatusChange: (id: number, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
}

export function TaskColumn({ title, tasks, onStatusChange, onEdit }: TaskColumnProps) {
  return (
    <div className={styles.column}>
      <h2 className={styles.heading}>
        {title} ({tasks.length})
      </h2>
      <div className={styles.cardList}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}
