import { KanbanBoard } from "./components/KanbanBoard";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>📋 タスク管理ボード</h1>
      </header>
      <main>
        <KanbanBoard />
      </main>
    </div>
  );
}

export default App;
