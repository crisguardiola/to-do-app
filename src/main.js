import './style.css'
import { ensureSession, getCurrentUser, onAuthStateChange, signUpWithEmail, signInWithEmail, signOut } from './auth.js'
import { fetchTodos, getTodos, addTodo, toggleTodo, deleteTodo } from './data/todos.js'
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

// Ensure auth popover is never shown on load—only when user clicks Sign in or Sign up
hideAuthModal()

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

// --- Init ---
init()
