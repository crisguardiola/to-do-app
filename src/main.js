import './style.css'

// Todos live in memory only — no backend or persistence
let todos = []

function addTodo(text) {
  const trimmed = text.trim()
  if (!trimmed) return
  todos.push({
    id: String(Date.now()),
    text: trimmed,
    completed: false,
  })
  renderTodos()
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
    renderTodos()
  }
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id)
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
    <header class="todo-header">
      <h1 class="todo-title">Todo List</h1>
    </header>
    <form id="todo-form" class="todo-form" aria-label="Add todo">
      <input type="text" id="todo-input" class="todo-input" placeholder="What do you need to do?" autocomplete="off" aria-label="Todo description" />
      <button type="submit" class="todo-add">Add</button>
    </form>
    <ul id="todo-list" class="todo-list" aria-label="Todo items"></ul>
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

renderTodos()
