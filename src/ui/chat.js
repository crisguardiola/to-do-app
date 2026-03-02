// --- AI Chat panel: messages, suggested tasks, form ---

const FRIENDLY_ERROR = "Sorry, I couldn't process that. Please try again later."
const BACKEND_UNREACHABLE = "Chat isn't available. Start the backend: in the project folder run `node server.js`, then reload."

/**
 * @typedef {{ role: 'user' | 'assistant', content: string, tasks?: string[] }} ChatMessage
 */

/** @type {ChatMessage[]} */
let messages = []

/**
 * @param {{ addTodo: (text: string, priority?: string) => Promise<{ error: Error | null }>, loadTodos: () => Promise<void>, getTodos: () => Array, deleteTodo: (id: string) => Promise<{ error: Error | null }> }} deps
 */
export function initChat({ addTodo, loadTodos, getTodos, deleteTodo }) {
  const messagesEl = document.getElementById('chat-messages')
  const promptsEl = document.querySelector('.chat-prompts')
  const headerEl = document.querySelector('.chat-header')
  const panelInner = document.querySelector('.chat-panel-inner')
  const form = document.getElementById('chat-form')
  const input = document.getElementById('chat-input')
  const sendBtn = document.getElementById('chat-send-btn')

  if (!messagesEl || !form || !input) return

  const updateSendButtonState = () => {
    if (sendBtn) sendBtn.disabled = !input.value.trim()
  }

  updateSendButtonState()
  input.addEventListener('input', updateSendButtonState)

  // --- Chat interaction: intro, visibility, prompt cards, submit ---
  const setPromptsVisible = (visible) => {
    if (!promptsEl) return
    visible ? promptsEl.classList.remove('chat-prompts--hidden') : promptsEl.classList.add('chat-prompts--hidden')
  }
  const setHeaderVisible = (visible) => {
    if (!headerEl) return
    visible ? headerEl.classList.remove('chat-header--hidden') : headerEl.classList.add('chat-header--hidden')
  }
  const updateVisibilityFromMessages = () => {
    const hasMessages = messages.length > 0
    setPromptsVisible(!hasMessages)
    setHeaderVisible(!hasMessages)
  }

  const INTRO_HEADER_DELAY = 350
  const INTRO_TYPEWRITER_DELAY = 200
  const INTRO_REVEAL_DURATION = 450
  if (panelInner) panelInner.classList.add('intro')
  const subtitleEl = document.querySelector('.chat-subtitle')
  if (subtitleEl && panelInner) {
    const fullText = subtitleEl.textContent || ''
    subtitleEl.textContent = ''
    subtitleEl.classList.add('chat-subtitle--typing')
    const cursor = document.createElement('span')
    cursor.className = 'chat-subtitle-cursor'
    cursor.setAttribute('aria-hidden', 'true')
    cursor.textContent = '|'
    subtitleEl.appendChild(cursor)
    let i = 0
    const charDelay = 35
    function typeNext() {
      if (i < fullText.length) {
        subtitleEl.insertBefore(document.createTextNode(fullText[i]), cursor)
        i++
        setTimeout(typeNext, charDelay)
      } else {
        cursor.remove()
        subtitleEl.classList.remove('chat-subtitle--typing')
        panelInner.classList.add('intro-show-prompts')
        setTimeout(() => panelInner.classList.remove('intro', 'intro-show-header', 'intro-show-prompts'), INTRO_REVEAL_DURATION)
      }
    }
    setTimeout(() => {
      panelInner.classList.add('intro-show-header')
      setTimeout(typeNext, INTRO_TYPEWRITER_DELAY)
    }, INTRO_HEADER_DELAY)
  } else if (panelInner) {
    panelInner.classList.remove('intro')
  }

  document.querySelectorAll('.chat-prompt-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt')
      if (prompt && input) {
        input.value = prompt
        input.focus()
        updateSendButtonState()
      }
    })
  })
  if (input.tagName === 'TEXTAREA') {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        form.requestSubmit()
      }
    })
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const text = input.value.trim()
    if (!text) return
    appendMessage({ role: 'user', content: text })
    input.value = ''
    const loadingEl = renderLoading()
    messagesEl?.appendChild(loadingEl)
    scrollToBottom()
    sendBtn.disabled = true
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) })
      const data = await res.json().catch(() => ({}))
      removeLoading()
      if (!res.ok || data.error) {
        const errorMsg = (res.status === 404 || res.status === 502) && !data.error ? BACKEND_UNREACHABLE : (data.error || FRIENDLY_ERROR)
        appendMessage({ role: 'assistant', content: errorMsg })
      } else if (Array.isArray(data.tasks) && data.tasks.length > 0) {
        appendMessage({ role: 'assistant', content: '', tasks: data.tasks })
      } else {
        appendMessage({ role: 'assistant', content: FRIENDLY_ERROR })
      }
    } catch (err) {
      removeLoading()
      appendMessage({ role: 'assistant', content: BACKEND_UNREACHABLE })
    } finally {
      updateSendButtonState()
    }
  })

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
          addBtn.className = 'btn button-secondaryS chat-add-btn'
          addBtn.textContent = 'Add'
          addBtn.addEventListener('click', async () => {
            const isAdded = addBtn.classList.contains('chat-add-btn--added')
            if (isAdded) {
              const todos = getTodos().filter((t) => t.text === task)
              const todo = todos[todos.length - 1]
              if (todo) {
                const { error } = await deleteTodo(todo.id)
                if (!error) {
                  addBtn.classList.remove('chat-add-btn--added')
                  addBtn.textContent = 'Add'
                  await loadTodos()
                }
              }
            } else {
              const { error } = await addTodo(task, 'undefined')
              if (!error) {
                addBtn.classList.add('chat-add-btn--added')
                addBtn.textContent = 'Added'
                await loadTodos()
              }
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

  function removeLoading() {
    const loading = messagesEl?.querySelector('[data-loading="true"]')
    loading?.remove()
  }

  function renderAll() {
    if (!messagesEl) return
    messagesEl.innerHTML = ''
    for (const msg of messages) {
      messagesEl.appendChild(renderMessage(msg))
    }
    updateVisibilityFromMessages()
    scrollToBottom()
  }

  function appendMessage(msg) {
    messages.push(msg)
    const el = renderMessage(msg)
    messagesEl?.appendChild(el)
    updateVisibilityFromMessages()
    scrollToBottom()
  }

  renderAll()
}
