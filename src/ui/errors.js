// --- Error UI ---
/**
 * Show an error message in the todo error element.
 * @param {string} message
 */
export function setError(message) {
  const el = document.getElementById('todo-error')
  if (el) {
    el.textContent = message
    el.hidden = false
  }
}

/**
 * Clear and hide the todo error message.
 */
export function clearError() {
  const el = document.getElementById('todo-error')
  if (el) {
    el.textContent = ''
    el.hidden = true
  }
}
