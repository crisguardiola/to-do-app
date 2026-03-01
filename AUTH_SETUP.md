# Auth setup (Supabase)

This app uses **anonymous sign-in** so visitors can use the app without an account. When they create an account or sign in, their todos are tied to that user.

## 1. Enable Anonymous Sign-In

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Authentication** → **Providers**.
3. Find **Anonymous Sign-In** and turn it **on**.

## 2. Enable Manual Linking (for “Create account”)

So that “Create account” converts the current anonymous user (and keeps their todos) instead of creating a new user:

1. In the dashboard, go to **Authentication** → **Providers**.
2. Enable **Manual linking** (e.g. under Email or in the auth settings).
3. This allows linking an email/password (or OAuth) to the existing anonymous user via `updateUser()`.

If manual linking is not enabled, “Create account” may create a separate user; the anonymous user’s todos would stay with the anonymous account.

## 3. Run migrations

Apply the migrations so `todos` has `user_id` and RLS is in place:

```bash
supabase db push
```

Or with the Supabase CLI linked to your project:

```bash
supabase migration up
```

## 4. Optional: Email confirmation

If **Confirm email** is enabled in Authentication → Settings, users who choose “Create account” may need to confirm their email before they can set a password. The flow in the app uses `updateUser({ email, password })`; if your project requires verification, you may need a two-step flow (set email → verify → set password).

## Behavior summary

| Action | What happens |
|--------|----------------|
| **Open app** | If there’s no session, the app signs the user in anonymously. They can add/edit/delete todos immediately. |
| **Create account** | The current anonymous user is upgraded with email/password (same user id). Their existing todos stay attached. |
| **Sign in** | User signs in with an existing account. Any todos created in this session as a guest are moved to that account. |
| **Sign out** | Session ends. On the next visit, a new anonymous session is created. |
