export function setError(message) {
  const el = document.getElementById('todo-error')
  if (el) {
    el.textContent = message
    el.hidden = false
  }
}

export function clearError() {
  const el = document.getElementById('todo-error')
  if (el) {
    el.textContent = ''
    el.hidden = true
  }
}

export function setLoading(loading) {
  const form = document.getElementById('todo-form')
  const input = document.getElementById('todo-input')
  const addBtn = form?.querySelector('.todo-add')
  if (form) form.disabled = loading
  if (input) input.disabled = loading
  if (addBtn) addBtn.disabled = loading
}

export function renderTodos(todos, { onToggle, onDelete }) {
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
    checkbox.addEventListener('change', () => onToggle(todo.id))
    const label = document.createElement('span')
    label.className = 'todo-text'
    label.textContent = todo.text
    const deleteBtn = document.createElement('button')
    deleteBtn.type = 'button'
    deleteBtn.className = 'todo-delete'
    deleteBtn.textContent = 'Delete'
    deleteBtn.addEventListener('click', () => onDelete(todo.id))
    li.appendChild(checkbox)
    li.appendChild(label)
    li.appendChild(deleteBtn)
    listEl.appendChild(li)
  }
}
