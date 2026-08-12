"use strict";

const STORAGE_KEY = "tasks";

const STATUS_LABELS = {
  todo: "未着手",
  doing: "作業中",
  done: "完了",
};

const STATUS_ORDER = ["todo", "doing", "done"];

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function makeSampleTasks() {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const sample = [
    { title: "タスクA", status: "todo", offset: 0, priority: "high", dueDateOffset: 7 },
    { title: "タスクB", status: "todo", offset: 1, priority: "low", dueDateOffset: null },
    { title: "タスクC", status: "doing", offset: 2, priority: "medium", dueDateOffset: -2 },
    { title: "タスクD", status: "done", offset: 3, priority: "low", dueDateOffset: -1 },
  ];
  return sample.map((t) => ({
    id: (now + t.offset).toString(),
    title: t.title,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDateOffset === null ? null : toDateInputValue(new Date(now + t.dueDateOffset * oneDay)),
    createdAt: new Date(now + t.offset).toISOString(),
  }));
}

let tasks = loadTasks();
let editingTaskId = null; // null = 新規作成モード, それ以外 = 編集モード（対象タスクのid）

const newTaskBtn = document.getElementById("newTaskBtn");
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const taskForm = document.getElementById("taskForm");
const titleInput = document.getElementById("titleInput");
const priorityInput = document.getElementById("priorityInput");
const dueDateInput = document.getElementById("dueDateInput");
const statusField = document.getElementById("statusField");
const statusInput = document.getElementById("statusInput");
const formError = document.getElementById("formError");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");

function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    // 初回起動時（保存データが一度も存在しない）はサンプルカードを表示する
    const sample = makeSampleTasks();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
    return sample;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function render() {
  STATUS_ORDER.forEach((status) => {
    const listEl = document.getElementById(`list-${status}`);
    const countEl = document.getElementById(`count-${status}`);
    const columnTasks = tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    listEl.innerHTML = "";
    columnTasks.forEach((task) => {
      listEl.appendChild(createCardElement(task));
    });
    countEl.textContent = columnTasks.length;
  });
}

function isOverdue(task) {
  if (!task.dueDate || task.status === "done") return false;
  return task.dueDate < toDateInputValue(new Date());
}

function createCardElement(task) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.id = task.id;
  card.dataset.priority = task.priority;
  card.draggable = true;

  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
    card.classList.add("dragging");
  });
  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
  });

  const titleEl = document.createElement("div");
  titleEl.className = "card-title";
  titleEl.textContent = task.title;

  const dueDateEl = document.createElement("div");
  dueDateEl.className = "card-due-date";
  if (isOverdue(task)) dueDateEl.classList.add("overdue");
  dueDateEl.textContent = `期限: ${task.dueDate ? task.dueDate.replace(/-/g, "/") : "未設定"}`;

  const controls = document.createElement("div");
  controls.className = "card-controls";

  const select = document.createElement("select");
  select.className = "status-select";
  STATUS_ORDER.forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = `状態:${STATUS_LABELS[status]}`;
    if (status === task.status) option.selected = true;
    select.appendChild(option);
  });
  select.addEventListener("click", (e) => e.stopPropagation());
  select.addEventListener("change", () => {
    task.status = select.value;
    saveTasks();
    render();
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.title = "削除";
  deleteBtn.textContent = "🗑";
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const ok = confirm(`「${task.title}」を削除しますか？`);
    if (!ok) return;
    tasks = tasks.filter((t) => t.id !== task.id);
    saveTasks();
    render();
  });

  controls.appendChild(select);
  controls.appendChild(deleteBtn);

  card.appendChild(titleEl);
  card.appendChild(dueDateEl);
  card.appendChild(controls);

  card.addEventListener("click", () => openEditModal(task));

  return card;
}

function openCreateModal(presetStatus) {
  editingTaskId = null;
  modalTitle.textContent = "新規タスク";
  submitBtn.textContent = "追加";
  titleInput.value = "";
  priorityInput.value = "medium";
  dueDateInput.value = "";
  statusField.classList.remove("hidden");
  statusInput.value = presetStatus;
  hideError();
  showModal();
}

function openEditModal(task) {
  editingTaskId = task.id;
  modalTitle.textContent = "タスクを編集";
  submitBtn.textContent = "保存";
  titleInput.value = task.title;
  priorityInput.value = task.priority;
  dueDateInput.value = task.dueDate || "";
  statusField.classList.add("hidden");
  hideError();
  showModal();
}

function showModal() {
  modalOverlay.classList.remove("hidden");
  titleInput.focus();
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  editingTaskId = null;
}

function showError(message) {
  formError.textContent = message;
  formError.classList.remove("hidden");
}

function hideError() {
  formError.textContent = "";
  formError.classList.add("hidden");
}

function handleSubmit(e) {
  e.preventDefault();
  const title = titleInput.value.trim();

  if (title.length === 0) {
    showError("タイトルを入力してください。");
    return;
  }
  if (title.length > 100) {
    showError("タイトルは100文字以内で入力してください。");
    return;
  }

  const dueDate = dueDateInput.value || null;

  if (editingTaskId === null) {
    tasks.push({
      id: Date.now().toString(),
      title,
      status: statusInput.value,
      priority: priorityInput.value,
      dueDate,
      createdAt: new Date().toISOString(),
    });
  } else {
    const task = tasks.find((t) => t.id === editingTaskId);
    if (task) {
      task.title = title;
      task.priority = priorityInput.value;
      task.dueDate = dueDate;
    }
  }

  saveTasks();
  render();
  closeModal();
}

newTaskBtn.addEventListener("click", () => openCreateModal("todo"));

document.querySelectorAll(".btn-add-task").forEach((btn) => {
  btn.addEventListener("click", () => openCreateModal(btn.dataset.status));
});

cancelBtn.addEventListener("click", closeModal);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

taskForm.addEventListener("submit", handleSubmit);

STATUS_ORDER.forEach((status) => {
  const listEl = document.getElementById(`list-${status}`);
  listEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    listEl.classList.add("drag-over");
  });
  listEl.addEventListener("dragleave", () => {
    listEl.classList.remove("drag-over");
  });
  listEl.addEventListener("drop", (e) => {
    e.preventDefault();
    listEl.classList.remove("drag-over");
    const id = e.dataTransfer.getData("text/plain");
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.status = status;
    saveTasks();
    render();
  });
});

render();
