import { useState } from "react";
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
  // 列をまたいだドラッグ&ドロップを検知できるよう、ドラッグ中のタスクは列の外(この階層)で管理する
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  return (
    <div className={styles.board}>
      {STATUS_OPTIONS.map(({ value, label }) => (
        <TaskColumn
          key={value}
          status={value}
          title={label}
          tasks={tasks.filter((task) => task.status === value)}
          draggedTask={draggedTask}
          onDragStart={setDraggedTask}
          onDragEnd={() => setDraggedTask(null)}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onReorder={onReorder}
        />
      ))}
    </div>
  );
}
