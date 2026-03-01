import './style.css'
import { fetchTodos, getTodos, addTodo, toggleTodo, deleteTodo } from './data/todos.js'
import { setError, clearError } from './ui/errors.js'
import { renderTodos, setLoading } from './ui/dom.js'

// --- Load & render ---
async function loadTodos() {
  setLoading(true)
  const { data, error } = await fetchTodos()
  setLoading(false)
  if (error) {
    setError(error.message)
    return
  }
  clearError()
  renderTodos(data, {
    onToggle: handleToggle,
    onDelete: handleDelete,
  })
}

// --- Toggle / delete handlers ---
async function handleToggle(id) {
  const todo = getTodos().find((t) => t.id === id)
  if (!todo) return
  clearError()
  const { error } = await toggleTodo(id, !todo.completed)
  if (error) {
    setError(error.message)
    return
  }
  await loadTodos()
}

async function handleDelete(id) {
  clearError()
  const { error } = await deleteTodo(id)
  if (error) {
    setError(error.message)
    return
  }
  await loadTodos()
}

// --- Form submit ---
const form = document.getElementById('todo-form')
const input = document.getElementById('todo-input')

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const text = input.value
  input.value = ''
  input.focus()
  if (!text.trim()) return
  setLoading(true)
  clearError()
  const { error } = await addTodo(text)
  setLoading(false)
  if (error) {
    setError(error.message)
    return
  }
  await loadTodos()
})

// --- Init ---
setLoading(true)
loadTodos().finally(() => setLoading(false))
