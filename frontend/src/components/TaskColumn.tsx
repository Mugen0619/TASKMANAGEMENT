import { useState, type DragEvent } from "react";
import type { Task, TaskStatus } from "../types/task";
import { TaskCard } from "./TaskCard";
import styles from "./TaskColumn.module.css";

interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onStatusChange: (id: number, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onReorder: (status: TaskStatus, taskIds: number[]) => void;
}

export function TaskColumn({ status, title, tasks, onStatusChange, onEdit, onReorder }: TaskColumnProps) {
  const [draggedId, setDraggedId] = useState<number | null>(null);

  function moveDragged(targetId: number | null) {
    if (draggedId === null) {
      return;
    }
    const ids = tasks.map((task) => task.id);
    const fromIndex = ids.indexOf(draggedId);
    if (fromIndex === -1) {
      return;
    }
    ids.splice(fromIndex, 1);
    if (targetId === null) {
      ids.push(draggedId);
    } else {
      const targetIndex = ids.indexOf(targetId);
      ids.splice(targetIndex, 0, draggedId);
    }
    onReorder(status, ids);
  }

  function handleCardDrop(event: DragEvent, targetId: number) {
    event.preventDefault();
    event.stopPropagation();
    if (draggedId !== targetId) {
      moveDragged(targetId);
    }
    setDraggedId(null);
  }

  function handleColumnDrop(event: DragEvent) {
    event.preventDefault();
    moveDragged(null);
    setDraggedId(null);
  }

  return (
    <div
      className={styles.column}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleColumnDrop}
    >
      <h2 className={styles.heading}>
        {title} ({tasks.length})
      </h2>
      <div className={styles.cardList}>
        {tasks.map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={() => setDraggedId(task.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleCardDrop(event, task.id)}
            onDragEnd={() => setDraggedId(null)}
            className={task.id === draggedId ? styles.dragging : styles.draggableCard}
          >
            <TaskCard task={task} onStatusChange={onStatusChange} onEdit={onEdit} />
          </div>
        ))}
      </div>
    </div>
  );
}
