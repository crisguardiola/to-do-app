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
const MEDIUM_FIRST_ORDER = { medium: 0, high: 1, low: 2, undefined: 3 }

function sortTodosByPriority(todos, highFirst = true) {
  return [...todos].sort((a, b) => {
    const pA = PRIORITY_ORDER[a.priority ?? 'undefined'] ?? 3
    const pB = PRIORITY_ORDER[b.priority ?? 'undefined'] ?? 3
    return highFirst ? pA - pB : pB - pA
  })
}

function sortTodosByMediumFirst(todos) {
  return [...todos].sort((a, b) => {
    const pA = MEDIUM_FIRST_ORDER[a.priority ?? 'undefined'] ?? 3
    const pB = MEDIUM_FIRST_ORDER[b.priority ?? 'undefined'] ?? 3
    return pA - pB
  })
}

function getSortedTodos(data) {
  const sortEl = document.getElementById('todo-sort')
  const sortBy = sortEl?.value ?? 'default'
  if (sortBy === 'priority-high') return sortTodosByPriority(data, true)
  if (sortBy === 'priority-medium') return sortTodosByMediumFirst(data)
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
const prioritySelect = document.getElementById('todo-priority') // hidden input
const priorityTag = document.getElementById('todo-priority-tag')
const priorityDropdown = document.getElementById('todo-priority-dropdown')

// Priority tag dropdown: open/close and sync tag label + hidden value
if (priorityTag && priorityDropdown) {
  const options = priorityDropdown.querySelectorAll('[data-value]')
  const labels = { undefined: 'Priority', low: 'Low', medium: 'Medium', high: 'High' }

  function setPriority(value) {
    prioritySelect.value = value
    priorityTag.textContent = labels[value]
    priorityTag.className = 'todo-priority-tag todo-priority-tag--' + (value === 'undefined' ? 'undefined' : value)
    priorityTag.setAttribute('aria-expanded', 'false')
    priorityDropdown.hidden = true
  }

  priorityTag.addEventListener('click', (e) => {
    e.stopPropagation()
    const open = !priorityDropdown.hidden
    priorityDropdown.hidden = open
    priorityTag.setAttribute('aria-expanded', String(!open))
  })

  options.forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation()
      setPriority(opt.dataset.value)
    })
  })

  document.addEventListener('click', () => {
    if (!priorityDropdown.hidden) setPriority(prioritySelect.value)
  })
}

// Sort tag dropdown: same UI as priority tag
const sortSelect = document.getElementById('todo-sort') // hidden input
const sortTag = document.getElementById('todo-sort-tag')
const sortDropdown = document.getElementById('todo-sort-dropdown')
const SORT_LABELS = { default: 'Default order', 'priority-high': 'High first', 'priority-medium': 'Medium first', 'priority-low': 'Low first' }
if (sortTag && sortDropdown && sortSelect) {
  sortTag.addEventListener('click', (e) => {
    e.stopPropagation()
    const open = !sortDropdown.hidden
    sortDropdown.hidden = open
    sortTag.setAttribute('aria-expanded', String(!open))
    if (!sortDropdown.hidden) {
      const close = () => {
        sortDropdown.hidden = true
        sortTag.setAttribute('aria-expanded', 'false')
        document.removeEventListener('click', close)
      }
      setTimeout(() => document.addEventListener('click', close), 0)
    }
  })
  const SORT_CLASSES = { default: 'todo-sort-tag--default', 'priority-high': 'todo-sort-tag--priority-high', 'priority-medium': 'todo-sort-tag--priority-medium', 'priority-low': 'todo-sort-tag--priority-low' }
  sortDropdown.querySelectorAll('[data-value]').forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation()
      const value = opt.dataset.value
      sortSelect.value = value
      sortTag.textContent = SORT_LABELS[value]
      sortTag.className = 'todo-sort-tag ' + (SORT_CLASSES[value] || SORT_CLASSES.default)
      sortDropdown.hidden = true
      sortTag.setAttribute('aria-expanded', 'false')
      renderTodosWithSort(getTodos())
    })
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
  // Reset priority to default after successful add
  if (prioritySelect) prioritySelect.value = 'undefined'
  if (priorityTag) {
    priorityTag.textContent = 'Priority'
    priorityTag.className = 'todo-priority-tag todo-priority-tag--undefined'
  }
  if (priorityDropdown) priorityDropdown.hidden = true
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
