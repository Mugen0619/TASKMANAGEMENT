import { useEffect, useState } from "react";
import { createTask, fetchTasks, updateTask, updateTaskStatus } from "./api/tasks";
import type { Task, TaskStatus } from "./types/task";
import { KanbanBoard } from "./components/KanbanBoard";
import { TaskFormModal, type TaskFormValues } from "./components/TaskFormModal";
import "./App.css";

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

  async function handleStatusChange(id: number, status: TaskStatus) {
    try {
      const updated = await updateTaskStatus(id, status);
      setTasks((prev) => prev.map((task) => (task.id === updated.id ? updated : task)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "状態の更新に失敗しました");
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
          <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} onEdit={setEditingTask} />
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
        />
      )}
    </div>
  );
}

export default App;
