const STORAGE_KEY = "todo-list-sample-v1";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const countAll = document.getElementById("count-all");
const clearDoneButton = document.getElementById("clear-done");
const clearAllButton = document.getElementById("clear-all");

let todos = [];

function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];

    return data
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        id: typeof item.id === "string" && item.id ? item.id : crypto.randomUUID(),
        text: typeof item.text === "string" ? item.text.trim() : "",
        done: Boolean(item.done),
        createdAt: Number.isFinite(item.createdAt) ? item.createdAt : Date.now(),
      }))
      .filter((item) => item.text);
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function updateCounts() {
  const remaining = todos.filter((item) => !item.done).length;
  countAll.textContent = `残り ${remaining} 件`;
  clearDoneButton.disabled = !todos.some((item) => item.done);
  clearAllButton.disabled = todos.length === 0;
}

function renderTodos() {
  list.innerHTML = "";

  todos.forEach((item) => {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.dataset.id = item.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.done;
    checkbox.setAttribute("aria-label", item.done ? "未完了に戻す" : "完了にする");

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = item.text;
    if (item.done) text.classList.add("done");

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "todo-delete";
    remove.textContent = "削除";
    remove.setAttribute("aria-label", "削除する");

    li.append(checkbox, text, remove);
    list.appendChild(li);
  });

  updateCounts();
}

function addTodo(text) {
  todos.unshift({
    id: crypto.randomUUID(),
    text,
    done: false,
    createdAt: Date.now(),
  });
  saveTodos();
  renderTodos();
}

function toggleTodo(id) {
  todos = todos.map((item) =>
    item.id === id ? { ...item, done: !item.done } : item
  );
  saveTodos();
  renderTodos();
}

function removeTodo(id) {
  todos = todos.filter((item) => item.id !== id);
  saveTodos();
  renderTodos();
}

function clearDone() {
  todos = todos.filter((item) => !item.done);
  saveTodos();
  renderTodos();
}

function clearAll() {
  todos = [];
  saveTodos();
  renderTodos();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = input.value.trim();
  if (!value) return;
  addTodo(value);
  input.value = "";
  input.focus();
});

list.addEventListener("click", (event) => {
  const target = event.target;
  const item = target.closest(".todo-item");
  if (!item) return;

  if (target.matches("input[type=\"checkbox\"]")) {
    toggleTodo(item.dataset.id);
    return;
  }

  if (target.matches("button.todo-delete")) {
    removeTodo(item.dataset.id);
  }
});

clearDoneButton.addEventListener("click", () => {
  clearDone();
});

clearAllButton.addEventListener("click", () => {
  clearAll();
});

function init() {
  todos = loadTodos();
  renderTodos();
}

init();
