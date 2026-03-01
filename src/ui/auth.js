// --- Auth UI: bar + modal for sign up / sign in ---

/**
 * @param {{ isAnonymous: boolean, email?: string | null }} user
 */
export function renderAuthBar(user) {
  const labelEl = document.getElementById('auth-label')
  const createBtn = document.getElementById('auth-create-account')
  const signInBtn = document.getElementById('auth-sign-in')
  const signOutBtn = document.getElementById('auth-sign-out')

  if (!labelEl || !createBtn || !signInBtn || !signOutBtn) return

  if (!user) {
    labelEl.textContent = ''
    createBtn.hidden = true
    signInBtn.hidden = true
    signOutBtn.hidden = true
    return
  }

  if (user.is_anonymous) {
    labelEl.textContent = 'Using as guest'
    createBtn.hidden = false
    signInBtn.hidden = false
    signOutBtn.hidden = true
  } else {
    labelEl.textContent = user.email ? `Signed in as ${user.email}` : 'Signed in'
    createBtn.hidden = true
    signInBtn.hidden = true
    signOutBtn.hidden = false
  }
}

/**
 * Show modal for "Create account" (convert anonymous to permanent).
 * @param {(email: string, password: string) => void} onSubmit
 */
export function showCreateAccountModal(onSubmit) {
  const modal = document.getElementById('auth-modal')
  const title = document.getElementById('auth-modal-title')
  const form = document.getElementById('auth-form')
  const emailEl = document.getElementById('auth-email')
  const passwordEl = document.getElementById('auth-password')
  const formError = document.getElementById('auth-form-error')
  const submitBtn = document.getElementById('auth-submit')

  if (!modal || !title || !form || !emailEl || !passwordEl || !formError || !submitBtn) return

  title.textContent = 'Create account'
  emailEl.required = true
  passwordEl.required = true
  passwordEl.placeholder = 'Password (min 6 characters)'
  passwordEl.minLength = 6
  submitBtn.textContent = 'Create account'
  formError.hidden = true
  formError.textContent = ''
  emailEl.value = ''
  passwordEl.value = ''

  const handler = (e) => {
    e.preventDefault()
    const email = emailEl.value.trim()
    const password = passwordEl.value
    if (!email || !password) return
    onSubmit(email, password)
  }

  form.onsubmit = handler
  modal.hidden = false
  emailEl.focus()
}

/**
 * Show modal for "Sign in" (existing account).
 * @param {(email: string, password: string) => void} onSubmit
 */
export function showSignInModal(onSubmit) {
  const modal = document.getElementById('auth-modal')
  const title = document.getElementById('auth-modal-title')
  const form = document.getElementById('auth-form')
  const emailEl = document.getElementById('auth-email')
  const passwordEl = document.getElementById('auth-password')
  const formError = document.getElementById('auth-form-error')
  const submitBtn = document.getElementById('auth-submit')

  if (!modal || !title || !form || !emailEl || !passwordEl || !formError || !submitBtn) return

  title.textContent = 'Sign in'
  emailEl.required = true
  passwordEl.required = true
  passwordEl.placeholder = 'Password'
  submitBtn.textContent = 'Sign in'
  formError.hidden = true
  formError.textContent = ''
  emailEl.value = ''
  passwordEl.value = ''

  const handler = (e) => {
    e.preventDefault()
    const email = emailEl.value.trim()
    const password = passwordEl.value
    if (!email || !password) return
    onSubmit(email, password)
  }

  form.onsubmit = handler
  modal.hidden = false
  emailEl.focus()
}

export function hideAuthModal() {
  const modal = document.getElementById('auth-modal')
  if (modal) modal.hidden = true
}

function setupAuthModalBackdrop() {
  const modal = document.getElementById('auth-modal')
  if (!modal) return
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideAuthModal()
  })
}

/**
 * Show error in the auth modal (e.g. after failed sign up / sign in).
 * @param {string} message
 */
export function setAuthFormError(message) {
  const formError = document.getElementById('auth-form-error')
  if (!formError) return
  formError.textContent = message
  formError.hidden = !message
}

/**
 * Wire auth bar buttons and modal cancel. Call with auth handlers.
 * @param {{
 *   onCreateAccount: () => void,
 *   onSignIn: () => void,
 *   onSignOut: () => void,
 * }}
 */
export function wireAuthUI({ onCreateAccount, onSignIn, onSignOut }) {
  const createBtn = document.getElementById('auth-create-account')
  const signInBtn = document.getElementById('auth-sign-in')
  const signOutBtn = document.getElementById('auth-sign-out')
  const cancelBtn = document.getElementById('auth-cancel')

  createBtn?.addEventListener('click', onCreateAccount)
  signInBtn?.addEventListener('click', onSignIn)
  signOutBtn?.addEventListener('click', onSignOut)
  cancelBtn?.addEventListener('click', hideAuthModal)
  setupAuthModalBackdrop()
}
