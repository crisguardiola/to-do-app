-- Add priority to todos: undefined (default), low, medium, high
alter table public.todos
  add column if not exists priority text not null default 'undefined'
    check (priority in ('undefined', 'low', 'medium', 'high'));
