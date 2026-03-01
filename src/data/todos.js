import { supabase } from '../supabaseClient.js'

// --- State ---
let todos = []

// --- Fetch / get ---
/**
 * Fetch all todos for the current user from Supabase and update internal state.
 * @returns {{ data: Array, error: Error | null }}
 */
export async function fetchTodos() {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: true })
  if (!error) {
    todos = data ?? []
  }
  return { data: todos, error: error ? new Error(error.message) : null }
}

/**
 * Get the current in-memory list of todos (from last successful fetch).
 */
export function getTodos() {
  return todos
}

/** @typedef {'undefined' | 'low' | 'medium' | 'high'} TodoPriority */

// --- Mutations (add, toggle, delete, priority) ---
/**
 * Insert a new todo for the current user.
 * @param {string} text - Todo text
 * @param {TodoPriority} [priority='undefined'] - Priority (default Undefined)
 * @returns {{ error: Error | null }}
 */
export async function addTodo(text, priority = 'undefined') {
  const trimmed = text.trim()
  if (!trimmed) {
    return { error: null }
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: new Error('Not signed in') }
  }
  const validPriority = ['undefined', 'low', 'medium', 'high'].includes(priority) ? priority : 'undefined'
  const { error } = await supabase
    .from('todos')
    .insert({ text: trimmed, completed: false, user_id: user.id, priority: validPriority })
  return { error: error ? new Error(error.message) : null }
}

/**
 * Toggle completed state for a todo.
 * @param {string} id - Todo id
 * @param {boolean} completed - New completed value
 * @returns {{ error: Error | null }}
 */
export async function toggleTodo(id, completed) {
  const { error } = await supabase
    .from('todos')
    .update({ completed })
    .eq('id', id)
  return { error: error ? new Error(error.message) : null }
}

/**
 * Delete a todo by id.
 * @returns {{ error: Error | null }}
 */
export async function deleteTodo(id) {
  const { error } = await supabase.from('todos').delete().eq('id', id)
  return { error: error ? new Error(error.message) : null }
}

/**
 * Update priority for a todo.
 * @param {string} id - Todo id
 * @param {TodoPriority} priority - New priority
 * @returns {{ error: Error | null }}
 */
export async function updateTodoPriority(id, priority) {
  const validPriority = ['undefined', 'low', 'medium', 'high'].includes(priority) ? priority : 'undefined'
  const { error } = await supabase
    .from('todos')
    .update({ priority: validPriority })
    .eq('id', id)
  return { error: error ? new Error(error.message) : null }
}
