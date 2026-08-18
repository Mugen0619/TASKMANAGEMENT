import type { DragEvent } from "react";
import type { Task, TaskStatus } from "../types/task";
import { TaskCard } from "./TaskCard";
import styles from "./TaskColumn.module.css";

interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  draggedTask: Task | null;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  onStatusChange: (id: number, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onReorder: (status: TaskStatus, taskIds: number[]) => void;
}

export function TaskColumn({
  status,
  title,
  tasks,
  draggedTask,
  onDragStart,
  onDragEnd,
  onStatusChange,
  onEdit,
  onReorder,
}: TaskColumnProps) {
  // 同一列内での並べ替え(この列の表示順を入れ替える)
  function moveWithinColumn(targetId: number | null) {
    if (!draggedTask) {
      return;
    }
    const ids = tasks.map((task) => task.id);
    const fromIndex = ids.indexOf(draggedTask.id);
    if (fromIndex === -1) {
      return;
    }
    ids.splice(fromIndex, 1);
    if (targetId === null) {
      ids.push(draggedTask.id);
    } else {
      const targetIndex = ids.indexOf(targetId);
      ids.splice(targetIndex, 0, draggedTask.id);
    }
    onReorder(status, ids);
  }

  // ドロップ先の列が元の状態と異なる場合は状態変更、同じ場合は並べ替えとして扱う
  function handleDrop(targetId: number | null) {
    if (!draggedTask) {
      return;
    }
    if (draggedTask.status === status) {
      moveWithinColumn(targetId);
    } else {
      onStatusChange(draggedTask.id, status);
    }
  }

  function handleCardDrop(event: DragEvent, targetId: number) {
    event.preventDefault();
    event.stopPropagation();
    if (draggedTask?.id !== targetId) {
      handleDrop(targetId);
    }
    onDragEnd();
  }

  function handleColumnDrop(event: DragEvent) {
    event.preventDefault();
    handleDrop(null);
    onDragEnd();
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
            onDragStart={() => onDragStart(task)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleCardDrop(event, task.id)}
            onDragEnd={onDragEnd}
            className={task.id === draggedTask?.id ? styles.dragging : styles.draggableCard}
          >
            <TaskCard task={task} onStatusChange={onStatusChange} onEdit={onEdit} />
          </div>
        ))}
      </div>
    </div>
  );
}
