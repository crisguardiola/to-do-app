import { supabase } from './supabaseClient.js'

let todos = []
let onTodosChange = null

export function setOnTodosChange(callback) {
  onTodosChange = callback
}

export function getTodos() {
  return todos
}

export async function fetchTodos() {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) {
    return { error: error.message }
  }
  todos = data ?? []
  onTodosChange?.()
  return {}
}

export async function addTodo(text) {
  const trimmed = text.trim()
  if (!trimmed) return {}
  const { error } = await supabase.from('todos').insert({ text: trimmed, completed: false })
  if (error) {
    return { error: error.message }
  }
  await fetchTodos()
  return {}
}

export async function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id)
  if (!todo) return {}
  const { error } = await supabase
    .from('todos')
    .update({ completed: !todo.completed })
    .eq('id', id)
  if (error) {
    return { error: error.message }
  }
  await fetchTodos()
  return {}
}

export async function deleteTodo(id) {
  const { error } = await supabase.from('todos').delete().eq('id', id)
  if (error) {
    return { error: error.message }
  }
  await fetchTodos()
  return {}
}
