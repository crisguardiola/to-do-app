import './styles/index.css'
import {
  getTodos,
  setOnTodosChange,
  fetchTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
} from './todos.js'
import { setError, clearError, setLoading, renderTodos } from './ui.js'

async function handleToggle(id) {
  clearError()
  const result = await toggleTodo(id)
  if (result.error) setError(result.error)
}

async function handleDelete(id) {
  clearError()
  const result = await deleteTodo(id)
  if (result.error) setError(result.error)
}

function refreshUI() {
  renderTodos(getTodos(), { onToggle: handleToggle, onDelete: handleDelete })
}

setOnTodosChange(refreshUI)

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
  const result = await addTodo(text)
  setLoading(false)
  if (result.error) {
    setError(result.error)
  }
})

setLoading(true)
fetchTodos().then((result) => {
  setLoading(false)
  if (result.error) {
    setError(result.error)
  }
})
