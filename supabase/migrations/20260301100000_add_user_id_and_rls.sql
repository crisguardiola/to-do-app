-- Add user_id to todos so each user has their own list
alter table public.todos
  add column if not exists user_id uuid references auth.users(id);

-- Remove any pre-auth todos (no owner). Uncomment if you need to wipe legacy data:
-- delete from public.todos where user_id is null;

-- Require user_id for new rows (optional: uncomment to enforce)
-- alter table public.todos alter column user_id set not null;

-- Row-level security: users see and modify only their own todos
alter table public.todos enable row level security;

create policy "Users can read own todos"
  on public.todos for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own todos"
  on public.todos for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own todos"
  on public.todos for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own todos"
  on public.todos for delete
  to authenticated
  using (user_id = auth.uid());

-- Allow merging guest (anonymous) todos into the current user when they sign in to an existing account.
-- Only todos belonging to an anonymous user can be reassigned; prevents stealing other users' todos.
create or replace function public.merge_guest_todos(guest_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.todos
  set user_id = auth.uid()
  where user_id = guest_user_id
    and exists (
      select 1 from auth.users
      where id = guest_user_id and is_anonymous = true
    );
$$;

grant execute on function public.merge_guest_todos(uuid) to authenticated;
