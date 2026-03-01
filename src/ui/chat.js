// --- AI Chat panel: drawer, messages, suggested tasks ---

const FRIENDLY_ERROR = "Sorry, I couldn't process that. Please try again later."
const BACKEND_UNREACHABLE = "Chat isn't available. Start the backend: in the project folder run `node server.js`, then reload."

/**
 * @typedef {{ role: 'user' | 'assistant', content: string, tasks?: string[] }} ChatMessage
 */

/** @type {ChatMessage[]} */
let messages = []

/**
 * @param {{ addTodo: (text: string, priority?: string) => Promise<{ error: Error | null }>, loadTodos: () => Promise<void> }} deps
 */
export function initChat({ addTodo, loadTodos }) {
  const messagesEl = document.getElementById('chat-messages')
  const form = document.getElementById('chat-form')
  const input = document.getElementById('chat-input')
  const sendBtn = document.getElementById('chat-send-btn')

  if (!messagesEl || !form || !input) return

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
        // #region agent log
        fetch('http://127.0.0.1:7891/ingest/a3b3d6ac-17c1-4a6c-ab02-b849ff98f942',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'087c17'},body:JSON.stringify({sessionId:'087c17',location:'chat.js:errorDisplay',message:'Showing error',data:{status:res.status,errorMsgPreview:(errorMsg||'').slice(0,120)},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
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
      sendBtn.disabled = false
    }
  })

  renderAll()
}
