# To-Do App

A simple to-do list app built with Vite and vanilla JavaScript, backed by Supabase.

## Features

- Add new todos
- Mark todos complete or incomplete
- Delete todos

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- A [Supabase](https://supabase.com/) project (for data persistence)

## Setup

1. **Clone and install dependencies**

   ```bash
   cd to-do-app
   pnpm install
   ```

2. **Configure environment variables**

   Copy the example env file and fill in your Supabase credentials:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:

   - `VITE_SUPABASE_PROJECT_URL` — your Supabase project URL (e.g. `https://xxxx.supabase.co`)
   - `VITE_SUPABASE_PUBLISHABLE_KEY` — your project’s anon/public key

   You can find these in the Supabase dashboard under **Project Settings → API**.

3. **Apply the database schema (optional)**

   If you use Supabase locally or need the schema, run the migration in `supabase/migrations/` (e.g. via the Supabase CLI or by running the SQL in the Supabase SQL editor).

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `pnpm dev`     | Start the dev server     |
| `pnpm build`   | Build for production     |
| `pnpm preview` | Preview the production build |

## Tech stack

- **Vite** — build tool and dev server
- **Vanilla JavaScript** — no framework
- **Supabase** — backend (auth/database)
