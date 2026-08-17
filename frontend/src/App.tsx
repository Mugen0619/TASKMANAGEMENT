import { useEffect, useState } from "react";
import { createTask, deleteTask, fetchTasks, reorderTasks, updateTask, updateTaskStatus } from "./api/tasks";
import type { Task, TaskStatus } from "./types/task";
import { KanbanBoard } from "./components/KanbanBoard";
import { TaskFormModal, type TaskFormValues } from "./components/TaskFormModal";
import "./App.css";

// 指定した状態（列）内のタスクだけを、orderedIdsの順に並べ替える（それ以外の相対順は維持する）
function reorderWithinStatus(tasks: Task[], status: TaskStatus, orderedIds: number[]): Task[] {
  const orderIndex = new Map(orderedIds.map((id, index) => [id, index]));
  return [...tasks].sort((a, b) => {
    if (a.status === status && b.status === status) {
      return (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0);
    }
    return 0;
  });
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleCreateTask(values: TaskFormValues) {
    const created = await createTask(values);
    setTasks((prev) => [...prev, created]);
    setIsCreateOpen(false);
  }

  async function handleUpdateTask(values: TaskFormValues) {
    if (!editingTask) {
      return;
    }
    const updated = await updateTask(editingTask.id, {
      title: values.title,
      priority: values.priority,
      dueDate: values.dueDate,
    });
    setTasks((prev) => prev.map((task) => (task.id === updated.id ? updated : task)));
    setEditingTask(null);
  }

  async function handleDeleteTask() {
    if (!editingTask) {
      return;
    }
    await deleteTask(editingTask.id);
    setTasks((prev) => prev.filter((task) => task.id !== editingTask.id));
    setEditingTask(null);
  }

  async function handleStatusChange(id: number, status: TaskStatus) {
    try {
      const updated = await updateTaskStatus(id, status);
      setTasks((prev) => prev.map((task) => (task.id === updated.id ? updated : task)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "状態の更新に失敗しました");
    }
  }

  async function handleReorder(status: TaskStatus, taskIds: number[]) {
    const previousTasks = tasks;
    setTasks((prev) => reorderWithinStatus(prev, status, taskIds));
    try {
      const reordered = await reorderTasks(status, taskIds);
      setTasks((prev) => prev.map((task) => reordered.find((r) => r.id === task.id) ?? task));
    } catch (err) {
      setTasks(previousTasks);
      alert(err instanceof Error ? err.message : "並べ替えに失敗しました");
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📋 タスク管理ボード</h1>
        <button type="button" className="new-task-button" onClick={() => setIsCreateOpen(true)}>
          ＋ 新規タスク
        </button>
      </header>
      <main>
        {isLoading && <p className="message">読み込み中...</p>}
        {!isLoading && error && <p className="message">エラー: {error}</p>}
        {!isLoading && !error && (
          <KanbanBoard
            tasks={tasks}
            onStatusChange={handleStatusChange}
            onEdit={setEditingTask}
            onReorder={handleReorder}
          />
        )}
      </main>
      {isCreateOpen && (
        <TaskFormModal mode="create" onCancel={() => setIsCreateOpen(false)} onSubmit={handleCreateTask} />
      )}
      {editingTask && (
        <TaskFormModal
          mode="edit"
          initialValues={{
            title: editingTask.title,
            priority: editingTask.priority,
            dueDate: editingTask.dueDate,
            status: editingTask.status,
          }}
          onCancel={() => setEditingTask(null)}
          onSubmit={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}

export default App;
