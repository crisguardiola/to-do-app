# Design guide

Quick reference for editing the look and structure of the todo app. All styling and layout live in HTML and CSS; no need to touch JavaScript for visual changes.

---

## Where to change what

| What you want to change | File |
|------------------------|------|
| **Colors, spacing, fonts, radii** (theme) | `src/design-tokens.css` |
| **Layout and component styles** (blocks, form, list, buttons) | `src/style.css` |
| **Page structure, copy, and empty state** | `index.html` |
| **How one todo row is built** (checkbox, label, delete) | `src/main.js` → `renderTodos()` (only if you need to add/remove elements in a row) |

---

## Design tokens

Tokens are in **`src/design-tokens.css`**. Use these variables in `style.css` instead of hard-coding values.

- **Colors:** `--color-bg`, `--color-text`, `--color-accent`, `--color-danger`, `--color-completed`, etc.
- **Spacing:** `--space-xs` through `--space-2xl` (4px → 32px). Prefer these over raw `px`.
- **Typography:** `--font-body`, `--font-size-*`, `--line-height-*`, `--font-weight-*`.
- **Radius:** `--radius-sm` through `--radius-full`.

Light/dark theme is handled in the same file: the `@media (prefers-color-scheme: dark)` block overrides the color variables.

---

## Class names (todo app)

We use a single prefix: **`.todo-*`**. New blocks or elements can follow the same pattern.

| Class | Purpose |
|-------|---------|
| `.todo-app` | Wrapper around the whole todo UI |
| `.todo-header` | Header section |
| `.todo-title` | Main heading ("Todo List") |
| `.todo-error` | Error message (e.g. network failure). ID: `todo-error` |
| `.todo-form` | Add-todo form. ID: `todo-form` |
| `.todo-input` | Text input for new todo. ID: `todo-input` |
| `.todo-add` | "Add" submit button |
| `.todo-empty` | Empty state message when there are no todos. ID: `todo-empty` |
| `.todo-list` | List of todos (`<ul>`). ID: `todo-list` |
| `.todo-item` | One todo row (`<li>`). Add `.completed` when done |
| `.todo-text` | Todo label text inside a row |
| `.todo-delete` | Delete button per row |

If you rename an **id** used by the app (`todo-form`, `todo-input`, `todo-list`, `todo-error`, `todo-empty`), update the same IDs in `src/main.js` where we call `getElementById`.

---

## CSS structure (`style.css`)

After importing tokens, the order is:

1. **Layout** — `body`, `#app`
2. **Todo app** — `.todo-app`, `.todo-header`, `.todo-title`
3. **Messages** — `.todo-error`, `.todo-empty`
4. **Form** — `.todo-form`, `.todo-input`, `.todo-add`
5. **List & items** — `.todo-list`, `.todo-item`, `.todo-text`, `.todo-delete`, `.completed`
6. **Fallback** — generic `button` (use component classes like `.todo-add` / `.todo-delete` when you want control)
