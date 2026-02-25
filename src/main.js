import './style.css'

const STORAGE_KEY = 'todos'

let todos = []

function loadTodos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) todos = parsed
    }
  } catch (_) {
    todos = []
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

function addTodo(text) {
  const trimmed = text.trim()
  if (!trimmed) return
  todos.push({
    id: String(Date.now()),
    text: trimmed,
    completed: false,
  })
  saveTodos()
  renderTodos()
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
    saveTodos()
    renderTodos()
  }
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id)
  saveTodos()
  renderTodos()
}

function renderTodos() {
  const listEl = document.getElementById('todo-list')
  if (!listEl) return
  listEl.innerHTML = ''
  for (const todo of todos) {
    const li = document.createElement('li')
    li.className = 'todo-item' + (todo.completed ? ' completed' : '')
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = todo.completed
    checkbox.setAttribute('aria-label', 'Mark as ' + (todo.completed ? 'incomplete' : 'complete'))
    checkbox.addEventListener('change', () => toggleTodo(todo.id))
    const label = document.createElement('span')
    label.className = 'todo-text'
    label.textContent = todo.text
    const deleteBtn = document.createElement('button')
    deleteBtn.type = 'button'
    deleteBtn.className = 'todo-delete'
    deleteBtn.textContent = 'Delete'
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id))
    li.appendChild(checkbox)
    li.appendChild(label)
    li.appendChild(deleteBtn)
    listEl.appendChild(li)
  }
}

document.querySelector('#app').innerHTML = `
  <div class="todo-app">
    <h1>Todo List</h1>
    <form id="todo-form" class="todo-form">
      <input type="text" id="todo-input" placeholder="What do you need to do?" autocomplete="off" />
      <button type="submit">Add</button>
    </form>
    <ul id="todo-list" class="todo-list"></ul>
  </div>
`

const form = document.getElementById('todo-form')
const input = document.getElementById('todo-input')

form.addEventListener('submit', (e) => {
  e.preventDefault()
  addTodo(input.value)
  input.value = ''
  input.focus()
})

loadTodos()
renderTodos()
