# Design guide – Todo app

Quick reference for changing the look and feel of the app.

**Where to edit:** All design tokens and component styles live in **`src/style.css`**. Edit tokens at the top (`:root`); dark mode in the same file (`@media (prefers-color-scheme: dark)`). Structure and copy live in **`index.html`**; how each todo row is built is in **`src/ui/dom.js`** (`renderTodos`).

---

## Design tokens (CSS variables)

Edit at the **top of `src/style.css`** inside `:root`. Dark mode overrides are in the same file under `@media (prefers-color-scheme: dark)`.

### Colors
| Variable | Use |
|----------|-----|
| `--color-bg` | Page background |
| `--color-bg-elevated` | Elevated surfaces (e.g. cards) |
| `--color-surface` | Inputs, buttons, cards |
| `--color-border` | Input/button borders |
| `--color-border-subtle` | Dividers between list items |
| `--color-text` | Primary text |
| `--color-text-secondary` | Secondary text (e.g. delete button default) |
| `--color-text-muted` | Placeholders, disabled |
| `--color-accent` | Links, primary actions, focus ring, checkbox accent |
| `--color-accent-hover` | Hover state for accent buttons/links |
| `--color-accent-muted` | Muted accent backgrounds (optional) |
| `--color-danger` | Delete button hover, errors |
| `--color-danger-hover` | Delete hover state |
| `--color-success` | Success states (optional) |
| `--color-completed` | Strikethrough text for completed todos |

### Spacing (use for padding, margins, gaps)
| Variable | Value |
|----------|--------|
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 12px |
| `--space-lg` | 16px |
| `--space-xl` | 24px |
| `--space-2xl` | 32px |

### Typography
| Variable | Value | Use |
|----------|--------|-----|
| `--font-body` | Inter, system-ui, … | All body and UI text |
| `--font-size-xs` | 12px | Small labels |
| `--font-size-sm` | 14px | Secondary text, delete button |
| `--font-size-base` | 16px | Body, inputs, primary buttons |
| `--font-size-lg` | 18px | Optional larger UI |
| `--font-size-xl` | 20px | Optional |
| `--font-size-2xl` | 24px | Page title |
| `--font-weight-normal` | 400 | Body |
| `--font-weight-medium` | 500 | Buttons, emphasis |
| `--font-weight-semibold` | 600 | Title |
| `--line-height-tight` | 1.25 | Headings |
| `--line-height-normal` | 1.5 | Body |
| `--line-height-relaxed` | 1.625 | Optional |

### Border radius
| Variable | Use |
|----------|-----|
| `--radius-sm` | 4px – checkboxes, small elements |
| `--radius-md` | 6px – inputs, buttons, list items |
| `--radius-lg` | 8px – generic button fallback |
| `--radius-xl` | 12px – cards, large surfaces |
| `--radius-full` | 9999px – pills, fully rounded |

---

## Main components and classes

| Component | Main class | File |
|-----------|------------|------|
| App container | `.todo-app` | `style.css` |
| Page title | `.todo-title` | `style.css` |
| Error message | `.todo-error` | `style.css` |
| **Base button** | `.btn` | `style.css` – shared by Add and Delete |
| Add form | `.todo-form`, `.todo-input`, `.todo-add` | `style.css` |
| Empty state | `.todo-empty-state` | `index.html` + `style.css` |
| List | `.todo-list` | `style.css` |
| List item | `.todo-item` | `style.css` |
| Item text | `.todo-text` | `style.css` |
| Completed item | `.todo-item.completed` | `style.css` |
| Delete button | `.todo-delete` | `style.css` |

Layout and max width for the app are set on `#app` (max-width 480px, padding).

---

## Where to change what

| What you want to change | File / location |
|-------------------------|------------------|
| **Colors, spacing, typography, radius** | `src/style.css` – `:root` (light) and `@media (prefers-color-scheme: dark)` |
| **Component layout** (form, list, items) | `src/style.css` – classes in the table above |
| **App width, page padding** | `src/style.css` – `#app` |
| **Structure and copy** (title, placeholder, “Add”, “Delete”) | `index.html` – markup inside `#app` |
| **How each todo row is built** (checkbox, text, delete button) | `src/ui/dom.js` – function `renderTodos()` |
| **Behaviour** (what happens on add/complete/delete) | `src/main.js` – event handlers and `loadTodos()` |

The app shell (header, form, list container) lives in `index.html`. Todo rows are created in `src/ui/dom.js` by `renderTodos()`; their classes (e.g. `.todo-item`, `.todo-text`, `.todo-delete`) are styled in `src/style.css`.
