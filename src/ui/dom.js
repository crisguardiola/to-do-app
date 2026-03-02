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
    const wasEmptyVisible = !emptyStateEl.hidden
    if (!isEmpty && wasEmptyVisible) {
      emptyStateEl.classList.add('todo-empty-state--exiting')
      appEl?.classList.add('todo-app--empty-exiting')
      const exitDurationMs = 520
      setTimeout(() => {
        emptyStateEl.hidden = true
        emptyStateEl.classList.remove('todo-empty-state--exiting')
        appEl?.classList.remove('todo-app--empty-exiting')
      }, exitDurationMs)
    } else {
      emptyStateEl.hidden = !isEmpty
      emptyStateEl.classList.remove('todo-empty-state--exiting')
      appEl?.classList.remove('todo-app--empty-exiting')
    }
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
    const priorityLabels = { undefined: 'Priority', low: 'Low', medium: 'Medium', high: 'High' }
    const priorityWrap = document.createElement('div')
    priorityWrap.className = 'todo-priority-tag-wrap'
    const priorityTag = document.createElement('button')
    priorityTag.type = 'button'
    priorityTag.className = 'todo-priority-tag todo-priority-tag--' + (priority === 'undefined' ? 'undefined' : priority)
    priorityTag.setAttribute('aria-label', 'Priority')
    priorityTag.title = 'Priority'
    priorityTag.setAttribute('aria-haspopup', 'listbox')
    priorityTag.setAttribute('aria-expanded', 'false')
    priorityTag.textContent = priorityLabels[priority]
    const priorityDropdown = document.createElement('div')
    priorityDropdown.className = 'todo-priority-dropdown'
    priorityDropdown.setAttribute('role', 'listbox')
    priorityDropdown.setAttribute('aria-label', 'Choose priority')
    priorityDropdown.hidden = true
    const dropdownOptions = [
      { value: 'low', label: 'Low', class: 'todo-priority-tag-option--low' },
      { value: 'medium', label: 'Medium', class: 'todo-priority-tag-option--medium' },
      { value: 'high', label: 'High', class: 'todo-priority-tag-option--high' },
    ]
    for (const opt of dropdownOptions) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.setAttribute('role', 'option')
      btn.className = 'todo-priority-tag-option ' + opt.class
      btn.dataset.value = opt.value
      btn.textContent = opt.label
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        onPriorityChange(todo.id, opt.value)
        priorityTag.textContent = opt.label
        priorityTag.className = 'todo-priority-tag todo-priority-tag--' + opt.value
        priorityDropdown.hidden = true
        priorityTag.setAttribute('aria-expanded', 'false')
      })
      priorityDropdown.appendChild(btn)
    }
    priorityTag.addEventListener('click', (e) => {
      e.stopPropagation()
      const open = !priorityDropdown.hidden
      priorityDropdown.hidden = open
      priorityTag.setAttribute('aria-expanded', String(!open))
      if (!priorityDropdown.hidden) {
        const close = () => {
          priorityDropdown.hidden = true
          priorityTag.setAttribute('aria-expanded', 'false')
          document.removeEventListener('click', close)
        }
        setTimeout(() => document.addEventListener('click', close), 0)
      }
    })
    priorityWrap.appendChild(priorityTag)
    priorityWrap.appendChild(priorityDropdown)
    const deleteBtn = document.createElement('button')
    deleteBtn.type = 'button'
    deleteBtn.className = 'btn button-secondaryS button-secondaryS--error todo-delete'
    deleteBtn.textContent = 'Delete'
    deleteBtn.addEventListener('click', () => onDelete(todo.id))
    li.appendChild(checkbox)
    li.appendChild(label)
    li.appendChild(priorityWrap)
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
