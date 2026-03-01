// --- Render list ---
/**
 * Render the list of todos into #todo-list.
 * @param {Array} todos - List of todo items { id, text, completed, ... }
 * @param {{ onToggle: (id: string) => void, onDelete: (id: string) => void }} callbacks
 */
export function renderTodos(todos, { onToggle, onDelete }) {
  const listEl = document.getElementById('todo-list')
  const emptyStateEl = document.getElementById('todo-empty-state')
  if (!listEl) return
  if (emptyStateEl) {
    emptyStateEl.hidden = todos.length > 0
  }
  listEl.innerHTML = ''
  for (const todo of todos) {
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
    const deleteBtn = document.createElement('button')
    deleteBtn.type = 'button'
    deleteBtn.className = 'btn todo-delete'
    deleteBtn.textContent = 'Delete'
    deleteBtn.addEventListener('click', () => onDelete(todo.id))
    li.appendChild(checkbox)
    li.appendChild(label)
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
