// --- Auth: anonymous-first, then convert or sign in ---
import { supabase } from './supabaseClient.js'

/**
 * Ensure we have a session. If not, sign in anonymously so the app works without sign-up.
 * Call once before loading todos.
 * @returns {{ user: User | null, error: Error | null }}
 */
export async function ensureSession() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) {
    return { user: null, error: sessionError }
  }
  if (session) {
    return { user: session.user, error: null }
  }
  const { data: { user }, error: anonError } = await supabase.auth.signInAnonymously()
  if (anonError) {
    return { user: null, error: anonError }
  }
  return { user, error: null }
}

/**
 * @returns {Promise<{ user: User | null }>}
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return { user }
}

/**
 * Subscribe to auth state changes (e.g. after sign in / sign out).
 * @param {(user: User | null) => void} callback
 * @returns {() => void} unsubscribe
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
  return () => subscription.unsubscribe()
}

/**
 * Create account: convert anonymous user to permanent (same user id → todos stay attached),
 * or create a new account if there is no session (e.g. anonymous sign-in disabled).
 * @param {{ email: string, password: string }} opts
 * @returns {{ data: object | null, error: Error | null }}
 */
export async function signUpWithEmail(opts) {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (currentUser?.is_anonymous) {
    const { data, error } = await supabase.auth.updateUser({
      email: opts.email,
      password: opts.password,
    })
    return {
      data: data?.user ?? null,
      error: error ? new Error(error.message) : null,
    }
  }
  const { data, error } = await supabase.auth.signUp({
    email: opts.email,
    password: opts.password,
  })
  return {
    data: data?.user ?? null,
    error: error ? new Error(error.message) : null,
  }
}

/**
 * Sign in with email/password (existing account).
 * If there was an anonymous session, its todos are migrated to the signed-in user.
 * @param {{ email: string, password: string }} opts
 * @returns {{ data: object | null, error: Error | null }}
 */
export async function signInWithEmail(opts) {
  const { data: { session: anonSession } } = await supabase.auth.getSession()
  const anonymousUserId = anonSession?.user?.id ?? null

  const { data, error } = await supabase.auth.signInWithPassword({
    email: opts.email,
    password: opts.password,
  })

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  if (anonymousUserId && data.user?.id && anonymousUserId !== data.user.id) {
    await supabase.rpc('merge_guest_todos', { guest_user_id: anonymousUserId })
  }

  return { data: data?.user ?? null, error: null }
}

/**
 * Sign out. Next visit will get a new anonymous session.
 */
export async function signOut() {
  await supabase.auth.signOut()
}
