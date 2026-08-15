import { useEffect, useState } from "react";
import { createTask, fetchTasks, type CreateTaskInput } from "./api/tasks";
import type { Task } from "./types/task";
import { KanbanBoard } from "./components/KanbanBoard";
import { NewTaskModal } from "./components/NewTaskModal";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleCreateTask(input: CreateTaskInput) {
    const created = await createTask(input);
    setTasks((prev) => [...prev, created]);
    setIsFormOpen(false);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📋 タスク管理ボード</h1>
        <button type="button" className="new-task-button" onClick={() => setIsFormOpen(true)}>
          ＋ 新規タスク
        </button>
      </header>
      <main>
        {isLoading && <p className="message">読み込み中...</p>}
        {!isLoading && error && <p className="message">エラー: {error}</p>}
        {!isLoading && !error && <KanbanBoard tasks={tasks} />}
      </main>
      {isFormOpen && (
        <NewTaskModal onCancel={() => setIsFormOpen(false)} onSubmit={handleCreateTask} />
      )}
    </div>
  );
}

export default App;
