// --- Auth UI: bar + modal for sign up / sign in ---

/**
 * @param {{ isAnonymous: boolean, email?: string | null }} user
 */
export function renderAuthBar(user) {
  const accountBtn = document.getElementById('auth-account-btn')
  const guestCtaEl = document.getElementById('auth-guest-cta')
  const guestCtaBtn = document.getElementById('auth-guest-cta-btn')

  if (!accountBtn) return

  if (!user || user.is_anonymous) {
    if (guestCtaEl && guestCtaBtn) {
      guestCtaEl.hidden = false
      guestCtaBtn.textContent = 'You are using the app as a guest'
    }
    accountBtn.textContent = 'Sign in'
    accountBtn.hidden = false
  } else {
    if (guestCtaEl) guestCtaEl.hidden = true
    accountBtn.textContent = 'Sign out'
    accountBtn.hidden = false
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

  title.textContent = 'Sign up'
  emailEl.required = true
  passwordEl.required = true
  passwordEl.placeholder = 'Password (min 6 characters)'
  passwordEl.minLength = 6
  submitBtn.textContent = 'Sign up'
  formError.hidden = true
  formError.textContent = ''
  emailEl.value = ''
  passwordEl.value = ''
  resetPasswordVisibility()

  const handler = (e) => {
    e.preventDefault()
    const email = emailEl.value.trim()
    const password = passwordEl.value
    if (!email || !password) return
    onSubmit(email, password)
  }

  form.onsubmit = handler
  const switchToSignIn = document.getElementById('auth-modal-switch-signin')
  const switchToCreate = document.getElementById('auth-modal-switch')
  if (switchToSignIn) switchToSignIn.hidden = true
  if (switchToCreate) switchToCreate.hidden = false
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
  resetPasswordVisibility()

  const handler = (e) => {
    e.preventDefault()
    const email = emailEl.value.trim()
    const password = passwordEl.value
    if (!email || !password) return
    onSubmit(email, password)
  }

  form.onsubmit = handler
  const switchToSignIn = document.getElementById('auth-modal-switch-signin')
  const switchToCreate = document.getElementById('auth-modal-switch')
  if (switchToSignIn) switchToSignIn.hidden = false
  if (switchToCreate) switchToCreate.hidden = true
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
 * Wire auth bar and modal. Call with auth handlers.
 * @param {{
 *   onSignIn: () => void,
 *   onCreateAccount: () => void,
 *   onSignOut: () => void,
 * }}
 */
export function wireAuthUI({ onSignIn, onCreateAccount, onSignOut }) {
  const accountBtn = document.getElementById('auth-account-btn')
  const guestCtaBtn = document.getElementById('auth-guest-cta-btn')
  const cancelBtn = document.getElementById('auth-cancel')
  const switchToCreate = document.getElementById('auth-switch-to-create')
  const switchToSignin = document.getElementById('auth-switch-to-signin')

  accountBtn?.addEventListener('click', (e) => {
    e.preventDefault()
    if (accountBtn.textContent === 'Sign out') {
      onSignOut()
    } else {
      onSignIn()
    }
  })
  guestCtaBtn?.addEventListener('click', (e) => {
    e.preventDefault()
    onSignIn()
  })
  cancelBtn?.addEventListener('click', hideAuthModal)
  switchToCreate?.addEventListener('click', () => { onCreateAccount() })
  switchToSignin?.addEventListener('click', () => { onSignIn() })
  setupAuthModalBackdrop()
  setupPasswordToggle()
}

function resetPasswordVisibility() {
  const passwordEl = document.getElementById('auth-password')
  const toggleBtn = document.getElementById('auth-password-toggle')
  const iconShow = toggleBtn?.querySelector('.auth-password-icon--show')
  const iconHide = toggleBtn?.querySelector('.auth-password-icon--hide')
  if (!passwordEl || !toggleBtn || !iconShow || !iconHide) return
  passwordEl.type = 'password'
  iconShow.hidden = false
  iconHide.hidden = true
  toggleBtn.setAttribute('aria-label', 'Show password')
  toggleBtn.setAttribute('title', 'Show password')
}

function setupPasswordToggle() {
  const passwordEl = document.getElementById('auth-password')
  const toggleBtn = document.getElementById('auth-password-toggle')
  const iconShow = toggleBtn?.querySelector('.auth-password-icon--show')
  const iconHide = toggleBtn?.querySelector('.auth-password-icon--hide')

  if (!passwordEl || !toggleBtn || !iconShow || !iconHide) return

  toggleBtn.addEventListener('click', () => {
    const isPassword = passwordEl.type === 'password'
    passwordEl.type = isPassword ? 'text' : 'password'
    iconShow.hidden = isPassword
    iconHide.hidden = !isPassword
    toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password')
    toggleBtn.setAttribute('title', isPassword ? 'Hide password' : 'Show password')
  })
}
