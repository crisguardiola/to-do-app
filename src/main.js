import './style.css'
import { ensureSession, getCurrentUser, onAuthStateChange, signUpWithEmail, signInWithEmail, signOut } from './auth.js'
import { fetchTodos, getTodos, addTodo, toggleTodo, deleteTodo, updateTodoPriority } from './data/todos.js'
import { setError, clearError } from './ui/errors.js'
import { renderTodos, setLoading } from './ui/dom.js'
import {
  renderAuthBar,
  showCreateAccountModal,
  showSignInModal,
  hideAuthModal,
  setAuthFormError,
  wireAuthUI,
} from './ui/auth.js'
import { initChat } from './ui/chat.js'

// Ensure auth popover is never shown on load—only when user clicks Sign in or Sign up
hideAuthModal()

// --- Sort by priority (order: high=0, medium=1, low=2, undefined=3) ---
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2, undefined: 3 }

function sortTodosByPriority(todos, highFirst = true) {
  return [...todos].sort((a, b) => {
    const pA = PRIORITY_ORDER[a.priority ?? 'undefined'] ?? 3
    const pB = PRIORITY_ORDER[b.priority ?? 'undefined'] ?? 3
    return highFirst ? pA - pB : pB - pA
  })
}

function getSortedTodos(data) {
  const sortEl = document.getElementById('todo-sort')
  const sortBy = sortEl?.value ?? 'default'
  if (sortBy === 'priority-high') return sortTodosByPriority(data, true)
  if (sortBy === 'priority-low') return sortTodosByPriority(data, false)
  return data
}

function renderTodosWithSort(todos) {
  renderTodos(getSortedTodos(todos), {
    onToggle: handleToggle,
    onDelete: handleDelete,
    onPriorityChange: handlePriorityChange,
  })
}

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
  renderTodosWithSort(data)
}

// --- Auth: ensure session then init (anonymous first, no blocking) ---
async function init() {
  setLoading(true)
  const { user, error: sessionError } = await ensureSession()
  if (sessionError) {
    setLoading(false)
    renderAuthBar(null)
    setError('Sign in or create an account to save your todos.')
    await loadTodos()
    return
  }
  renderAuthBar(user ?? null)
  setLoading(false)
  await loadTodos()
}

// Re-run when auth state changes (e.g. after sign in / sign out)
onAuthStateChange((user) => {
  renderAuthBar(user ?? null)
  loadTodos()
})

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

async function handlePriorityChange(id, priority) {
  clearError()
  const { error } = await updateTodoPriority(id, priority)
  if (error) {
    setError(error.message)
    return
  }
  await loadTodos()
}

// --- Form submit ---
const form = document.getElementById('todo-form')
const input = document.getElementById('todo-input')
const prioritySelect = document.getElementById('todo-priority')

// Keep add-form priority dropdown colour in sync with selection
if (prioritySelect) {
  prioritySelect.addEventListener('change', () => {
    prioritySelect.className = 'todo-priority-select priority-' + prioritySelect.value
  })
}

// Sort dropdown: re-render list when sort order changes
const sortSelect = document.getElementById('todo-sort')
if (sortSelect) {
  sortSelect.addEventListener('change', () => {
    renderTodosWithSort(getTodos())
  })
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const text = input.value
  const priority = prioritySelect?.value ?? 'undefined'
  input.value = ''
  input.focus()
  if (!text.trim()) return
  setLoading(true)
  clearError()
  const { error } = await addTodo(text, priority)
  setLoading(false)
  if (error) {
    setError(error.message)
    return
  }
  await loadTodos()
})

// --- Auth UI handlers ---
async function handleCreateAccount(email, password) {
  const { data, error } = await signUpWithEmail({ email, password })
  if (error) {
    setAuthFormError(error.message)
    return
  }
  setAuthFormError('')
  hideAuthModal()
  if (data) await loadTodos()
}

async function handleSignIn(email, password) {
  const { data, error } = await signInWithEmail({ email, password })
  if (error) {
    setAuthFormError(error.message)
    return
  }
  setAuthFormError('')
  hideAuthModal()
  if (data) await loadTodos()
}

wireAuthUI({
  onSignIn: () => showSignInModal(handleSignIn),
  onCreateAccount: () => showCreateAccountModal(handleCreateAccount),
  onSignOut: async () => {
    await signOut()
    await init()
  },
})

initChat({ addTodo, loadTodos })

// --- Init ---
init()
