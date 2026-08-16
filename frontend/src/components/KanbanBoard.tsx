import type { Task, TaskStatus } from "../types/task";
import { STATUS_OPTIONS } from "../constants/taskOptions";
import { TaskColumn } from "./TaskColumn";
import styles from "./KanbanBoard.module.css";

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (id: number, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onReorder: (status: TaskStatus, taskIds: number[]) => void;
}

export function KanbanBoard({ tasks, onStatusChange, onEdit, onReorder }: KanbanBoardProps) {
  return (
    <div className={styles.board}>
      {STATUS_OPTIONS.map(({ value, label }) => (
        <TaskColumn
          key={value}
          status={value}
          title={label}
          tasks={tasks.filter((task) => task.status === value)}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onReorder={onReorder}
        />
      ))}
    </div>
  );
}
