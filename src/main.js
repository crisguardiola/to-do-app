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

// --- Sort state: 'default' | 'list' | 'priority'; list/priority use asc/desc ---
let sortBy = 'default'
let sortDirection = 'asc' // for list: asc = A→Z, desc = Z→A; for priority: asc = High→Low, desc = Low→High

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2, undefined: 3 }

function sortTodosByList(todos, asc) {
  return [...todos].sort((a, b) => {
    const ta = (a.text ?? '').toLowerCase()
    const tb = (b.text ?? '').toLowerCase()
    const cmp = ta.localeCompare(tb)
    return asc ? cmp : -cmp
  })
}

function sortTodosByPriority(todos, highFirst = true) {
  return [...todos].sort((a, b) => {
    const pA = PRIORITY_ORDER[a.priority ?? 'undefined'] ?? 3
    const pB = PRIORITY_ORDER[b.priority ?? 'undefined'] ?? 3
    return highFirst ? pA - pB : pB - pA
  })
}

function getSortedTodos(data) {
  if (sortBy === 'list') return sortTodosByList(data, sortDirection === 'asc')
  if (sortBy === 'priority') return sortTodosByPriority(data, sortDirection === 'asc')
  return data
}

function updateSortArrows() {
  const listBtn = document.getElementById('todo-sort-list')
  const priorityBtn = document.getElementById('todo-sort-priority')
  const listArrow = document.getElementById('todo-sort-list-arrow')
  const priorityArrow = document.getElementById('todo-sort-priority-arrow')
  if (listArrow) {
    listArrow.textContent = sortBy === 'list' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'
  }
  if (listBtn) {
    listBtn.setAttribute('aria-label', sortBy === 'list' ? (sortDirection === 'asc' ? 'Sorted A→Z, click to reverse' : 'Sorted Z→A, click to reverse') : 'Sort by list name')
  }
  if (priorityArrow) {
    priorityArrow.textContent = sortBy === 'priority' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'
  }
  if (priorityBtn) {
    priorityBtn.setAttribute('aria-label', sortBy === 'priority' ? (sortDirection === 'asc' ? 'High first, click to reverse' : 'Low first, click to reverse') : 'Sort by priority')
  }
}

function updateSelectAllCheckbox(todos) {
  const selectAllEl = document.getElementById('todo-select-all')
  if (!selectAllEl) return
  if (todos.length === 0) {
    selectAllEl.checked = false
    selectAllEl.indeterminate = false
    selectAllEl.disabled = true
    return
  }
  selectAllEl.disabled = false
  const completedCount = todos.filter((t) => t.completed).length
  selectAllEl.checked = completedCount === todos.length
  selectAllEl.indeterminate = completedCount > 0 && completedCount < todos.length
}

function renderTodosWithSort(todos) {
  const sorted = getSortedTodos(todos)
  renderTodos(sorted, {
    onToggle: handleToggle,
    onDelete: handleDelete,
    onPriorityChange: handlePriorityChange,
  })
  updateSortArrows()
  updateSelectAllCheckbox(todos)
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

// Header sort buttons: Your list (A↔Z) and Priority (High↔Low); clicking active arrow reverses direction
const sortListBtn = document.getElementById('todo-sort-list')
const sortPriorityBtn = document.getElementById('todo-sort-priority')
if (sortListBtn) {
  sortListBtn.addEventListener('click', () => {
    if (sortBy === 'list') {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy = 'list'
      sortDirection = 'asc'
    }
    renderTodosWithSort(getTodos())
  })
}
if (sortPriorityBtn) {
  sortPriorityBtn.addEventListener('click', () => {
    if (sortBy === 'priority') {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy = 'priority'
      sortDirection = 'asc'
    }
    renderTodosWithSort(getTodos())
  })
}

// Select-all checkbox: toggle all todos completed/incomplete
const selectAllEl = document.getElementById('todo-select-all')
if (selectAllEl) {
  selectAllEl.addEventListener('change', async () => {
    const todos = getTodos()
    if (todos.length === 0) return
    const allCompleted = todos.every((t) => t.completed)
    const targetCompleted = !allCompleted
    clearError()
    setLoading(true)
    const results = await Promise.all(todos.map((t) => toggleTodo(t.id, targetCompleted)))
    setLoading(false)
    const err = results.find((r) => r.error)
    if (err) {
      setError(err.message)
      return
    }
    await loadTodos()
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

initChat({ addTodo, loadTodos, getTodos, deleteTodo })

// --- Init ---
init()
