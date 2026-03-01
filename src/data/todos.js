import { supabase } from '../supabaseClient.js'

// --- State ---
let todos = []

// --- Fetch / get ---
/**
 * Fetch all todos from Supabase and update internal state.
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

// --- Mutations (add, toggle, delete) ---
/**
 * Insert a new todo.
 * @returns {{ error: Error | null }}
 */
export async function addTodo(text) {
  const trimmed = text.trim()
  if (!trimmed) {
    return { error: null }
  }
  const { error } = await supabase
    .from('todos')
    .insert({ text: trimmed, completed: false })
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
