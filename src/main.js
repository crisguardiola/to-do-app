import './style.css'
import { supabase } from './supabaseClient.js'

let todos = []

async function fetchTodos() {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) {
    setError(error.message)
    return
  }
  clearError()
  todos = data ?? []
  renderTodos()
}

function setError(message) {
  const el = document.getElementById('todo-error')
  if (el) {
    el.textContent = message
    el.hidden = false
  }
}

function clearError() {
  const el = document.getElementById('todo-error')
  if (el) {
    el.textContent = ''
    el.hidden = true
  }
}

function setLoading(loading) {
  const form = document.getElementById('todo-form')
  const input = document.getElementById('todo-input')
  const addBtn = form?.querySelector('.todo-add')
  if (form) form.disabled = loading
  if (input) input.disabled = loading
  if (addBtn) addBtn.disabled = loading
}

async function addTodo(text) {
  const trimmed = text.trim()
  if (!trimmed) return
  setLoading(true)
  clearError()
  const { error } = await supabase.from('todos').insert({ text: trimmed, completed: false })
  setLoading(false)
  if (error) {
    setError(error.message)
    return
  }
  await fetchTodos()
}

async function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id)
  if (!todo) return
  clearError()
  const { error } = await supabase
    .from('todos')
    .update({ completed: !todo.completed })
    .eq('id', id)
  if (error) {
    setError(error.message)
    return
  }
  await fetchTodos()
}

async function deleteTodo(id) {
  clearError()
  const { error } = await supabase.from('todos').delete().eq('id', id)
  if (error) {
    setError(error.message)
    return
  }
  await fetchTodos()
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
    <p id="todo-error" class="todo-error" hidden aria-live="polite"></p>
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

setLoading(true)
fetchTodos().finally(() => setLoading(false))
