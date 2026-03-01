// --- AI Chat panel: drawer, messages, rate limit, suggested tasks ---

const STORAGE_KEY = 'todo_ai_chat_usage'
const DAILY_LIMIT = 10
const FRIENDLY_ERROR = "Sorry, I couldn't process that. Please try again later."
const BACKEND_UNREACHABLE = "Chat isn't available. Start the backend: in the project folder run `node server.js`, then reload."
const LIMIT_MESSAGE = "Sorry, you've reached the daily limit of 10 AI requests. Try again tomorrow."

/**
 * @typedef {{ role: 'user' | 'assistant', content: string, tasks?: string[] }} ChatMessage
 */

/** @type {ChatMessage[]} */
let messages = []

/**
 * Get today's date as YYYY-MM-DD.
 * @returns {string}
 */
function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * @returns {{ date: string, count: number }}
 */
function getUsage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { date: '', count: 0 }
    const data = JSON.parse(raw)
    return { date: String(data.date || ''), count: Number(data.count) || 0 }
  } catch {
    return { date: '', count: 0 }
  }
}

function saveUsage(date, count) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date, count }))
  } catch (_) {}
}

function isOverLimit() {
  const today = getTodayKey()
  const { date, count } = getUsage()
  if (date !== today) return false
  return count >= DAILY_LIMIT
}

function incrementUsage() {
  const today = getTodayKey()
  const { date, count } = getUsage()
  const newCount = date === today ? count + 1 : 1
  saveUsage(today, newCount)
}

/**
 * @param {{ addTodo: (text: string, priority?: string) => Promise<{ error: Error | null }>, loadTodos: () => Promise<void> }} deps
 */
export function initChat({ addTodo, loadTodos }) {
  const panel = document.getElementById('chat-panel')
  const toggleBtn = document.getElementById('chat-toggle-btn')
  const closeBtn = document.getElementById('chat-close-btn')
  const messagesEl = document.getElementById('chat-messages')
  const form = document.getElementById('chat-form')
  const input = document.getElementById('chat-input')
  const sendBtn = document.getElementById('chat-send-btn')

  if (!panel || !messagesEl || !form || !input) return

  function openPanel() {
    panel?.classList.add('chat-panel--open')
  }

  function closePanel() {
    panel?.classList.remove('chat-panel--open')
  }

  toggleBtn?.addEventListener('click', () => {
    if (panel?.classList.contains('chat-panel--open')) closePanel()
    else openPanel()
  })
  closeBtn?.addEventListener('click', closePanel)

  function scrollToBottom() {
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight
  }

  function renderMessage(msg) {
    const wrap = document.createElement('div')
    wrap.className = `chat-message chat-message--${msg.role}`

    if (msg.role === 'user') {
      const bubble = document.createElement('div')
      bubble.className = 'chat-bubble chat-bubble--user'
      bubble.textContent = msg.content
      wrap.appendChild(bubble)
    } else {
      const bubble = document.createElement('div')
      bubble.className = 'chat-bubble chat-bubble--assistant'
      if (msg.tasks && msg.tasks.length > 0) {
        const list = document.createElement('ul')
        list.className = 'chat-suggestions'
        for (const task of msg.tasks) {
          const li = document.createElement('li')
          li.className = 'chat-suggestion-item'
          const label = document.createElement('span')
          label.className = 'chat-suggestion-text'
          label.textContent = task
          const addBtn = document.createElement('button')
          addBtn.type = 'button'
          addBtn.className = 'btn chat-add-btn'
          addBtn.textContent = 'Add'
          addBtn.addEventListener('click', async () => {
            const { error } = await addTodo(task, 'undefined')
            if (!error) {
              addBtn.disabled = true
              addBtn.textContent = 'Added'
              await loadTodos()
            }
          })
          li.appendChild(label)
          li.appendChild(addBtn)
          list.appendChild(li)
        }
        bubble.appendChild(list)
      } else {
        bubble.textContent = msg.content
      }
      wrap.appendChild(bubble)
    }
    return wrap
  }

  function renderLoading() {
    const wrap = document.createElement('div')
    wrap.className = 'chat-message chat-message--assistant'
    wrap.setAttribute('data-loading', 'true')
    const bubble = document.createElement('div')
    bubble.className = 'chat-bubble chat-bubble--assistant chat-typing'
    bubble.innerHTML = '<span></span><span></span><span></span>'
    wrap.appendChild(bubble)
    return wrap
  }

  function renderAll() {
    if (!messagesEl) return
    messagesEl.innerHTML = ''
    for (const msg of messages) {
      messagesEl.appendChild(renderMessage(msg))
    }
    scrollToBottom()
  }

  function appendMessage(msg) {
    messages.push(msg)
    const el = renderMessage(msg)
    messagesEl?.appendChild(el)
    scrollToBottom()
  }

  function removeLoading() {
    const loading = messagesEl?.querySelector('[data-loading="true"]')
    loading?.remove()
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const text = input.value.trim()
    if (!text) return

    appendMessage({ role: 'user', content: text })
    input.value = ''

    if (isOverLimit()) {
      appendMessage({ role: 'assistant', content: LIMIT_MESSAGE })
      return
    }

    const loadingEl = renderLoading()
    messagesEl?.appendChild(loadingEl)
    scrollToBottom()

    sendBtn.disabled = true

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json().catch(() => ({}))
      removeLoading()

      if (!res.ok || data.error) {
        const errorMsg = (res.status === 404 || res.status === 502) && !data.error
          ? BACKEND_UNREACHABLE
          : (data.error || FRIENDLY_ERROR)
        appendMessage({ role: 'assistant', content: errorMsg })
      } else if (Array.isArray(data.tasks) && data.tasks.length > 0) {
        incrementUsage()
        appendMessage({ role: 'assistant', content: '', tasks: data.tasks })
      } else {
        appendMessage({ role: 'assistant', content: FRIENDLY_ERROR })
      }
    } catch (err) {
      removeLoading()
      appendMessage({ role: 'assistant', content: BACKEND_UNREACHABLE })
    } finally {
      sendBtn.disabled = false
    }
  })

  renderAll()
}
