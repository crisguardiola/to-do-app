/** Priority options for dropdowns: value -> label */
export const PRIORITY_OPTIONS = [
  { value: 'undefined', label: 'Undefined' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

// --- Render list ---
/**
 * Render the list of todos into #todo-list.
 * @param {Array} todos - List of todo items { id, text, completed, priority?, ... }
 * @param {{ onToggle: (id: string) => void, onDelete: (id: string) => void, onPriorityChange: (id: string, priority: string) => void }} callbacks
 */
export function renderTodos(todos, { onToggle, onDelete, onPriorityChange }) {
  const listEl = document.getElementById('todo-list')
  const emptyStateEl = document.getElementById('todo-empty-state')
  const appEl = listEl?.closest('.todo-app')
  if (!listEl) return
  const isEmpty = todos.length === 0
  if (emptyStateEl) {
    emptyStateEl.hidden = !isEmpty
  }
  if (appEl) {
    appEl.classList.toggle('todo-app--empty', isEmpty)
  }
  listEl.innerHTML = ''
  for (const todo of todos) {
    const priority = todo.priority ?? 'undefined'
    const li = document.createElement('li')
    li.className = 'todo-item' + (todo.completed ? ' completed' : '')
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = todo.completed
    checkbox.setAttribute('aria-label', 'Mark as ' + (todo.completed ? 'incomplete' : 'complete'))
    checkbox.addEventListener('change', () => onToggle(todo.id))
    const label = document.createElement('span')
    label.className = 'todo-text'
    label.textContent = todo.text
    const prioritySelect = document.createElement('select')
    prioritySelect.className = 'todo-priority-select priority-' + priority
    prioritySelect.setAttribute('aria-label', 'Priority')
    prioritySelect.title = 'Priority'
    for (const opt of PRIORITY_OPTIONS) {
      const option = document.createElement('option')
      option.value = opt.value
      option.textContent = opt.label
      if (opt.value === priority) option.selected = true
      prioritySelect.appendChild(option)
    }
    prioritySelect.addEventListener('change', () => {
      const newPriority = prioritySelect.value
      prioritySelect.className = 'todo-priority-select priority-' + newPriority
      onPriorityChange(todo.id, newPriority)
    })
    const deleteBtn = document.createElement('button')
    deleteBtn.type = 'button'
    deleteBtn.className = 'btn todo-delete'
    deleteBtn.textContent = 'Delete'
    deleteBtn.addEventListener('click', () => onDelete(todo.id))
    li.appendChild(checkbox)
    li.appendChild(label)
    li.appendChild(prioritySelect)
    li.appendChild(deleteBtn)
    listEl.appendChild(li)
  }
}

// --- Loading state ---
/**
 * Enable or disable the add form and input while loading.
 * @param {boolean} loading
 */
export function setLoading(loading) {
  const form = document.getElementById('todo-form')
  const input = document.getElementById('todo-input')
  const addBtn = form?.querySelector('.todo-add')
  if (form) form.disabled = loading
  if (input) input.disabled = loading
  if (addBtn) addBtn.disabled = loading
}
