# Design System

This document describes the design tokens and components used in the to-do app. Use it as a reference when making visual changes.

## Where to Edit

| What you want to change | File to edit |
|-------------------------|--------------|
| Colors, spacing, typography, layout dimensions | `src/styles/tokens.css` |
| Page layout, body styles, app container | `src/styles/base.css` |
| Component styles (todo items, form, buttons) | `src/styles/components.css` |

---

## Design Tokens

### Colors

| Variable | Light value | Usage |
|----------|-------------|-------|
| `--color-bg` | `#ffffff` | Page background |
| `--color-bg-elevated` | `#ffffff` | Elevated surfaces |
| `--color-surface` | `#ffffff` | Inputs, buttons, cards |
| `--color-border` | `#e5e5e5` | Primary borders |
| `--color-border-subtle` | `#f0f0f0` | Subtle dividers |
| `--color-text` | `#171717` | Primary text |
| `--color-text-secondary` | `#737373` | Secondary text |
| `--color-text-muted` | `#a3a3a3` | Placeholders, disabled |
| `--color-accent` | `#2563eb` | Links, focus rings, accents |
| `--color-accent-hover` | `#1d4ed8` | Accent hover state |
| `--color-accent-muted` | `#dbeafe` | Accent backgrounds |
| `--color-danger` | `#dc2626` | Errors, delete button hover |
| `--color-danger-hover` | `#b91c1c` | Danger hover state |
| `--color-success` | `#16a34a` | Success states |
| `--color-completed` | `#a3a3a3` | Completed todo text |

### Spacing

| Variable | Value | Usage |
|----------|-------|-------|
| `--space-xs` | 0.25rem (4px) | Tight padding |
| `--space-sm` | 0.5rem (8px) | Small gaps |
| `--space-md` | 0.75rem (12px) | Default padding |
| `--space-lg` | 1rem (16px) | Input padding |
| `--space-xl` | 1.5rem (24px) | Section spacing |
| `--space-2xl` | 2rem (32px) | Page padding |

### Typography

| Variable | Value | Usage |
|----------|-------|-------|
| `--font-body` | Inter, system-ui, … | All text |
| `--font-size-xs` | 0.75rem (12px) | Small labels |
| `--font-size-sm` | 0.875rem (14px) | Secondary text |
| `--font-size-base` | 1rem (16px) | Body text |
| `--font-size-lg` | 1.125rem (18px) | — |
| `--font-size-xl` | 1.25rem (20px) | — |
| `--font-size-2xl` | 1.5rem (24px) | Page title |
| `--line-height-tight` | 1.25 | Headings |
| `--line-height-normal` | 1.5 | Body |
| `--line-height-relaxed` | 1.625 | — |
| `--font-weight-normal` | 400 | Body |
| `--font-weight-medium` | 500 | Buttons |
| `--font-weight-semibold` | 600 | Headings |

### Border Radius

| Variable | Value |
|----------|-------|
| `--radius-sm` | 4px |
| `--radius-md` | 6px |
| `--radius-lg` | 8px |
| `--radius-xl` | 12px |
| `--radius-full` | 9999px |

### Layout & Component Dimensions

| Variable | Value | Usage |
|----------|-------|-------|
| `--layout-max-width` | 480px | App container max width |
| `--todo-item-min-height` | 2.5rem | Minimum height per todo row |
| `--checkbox-size` | 1.25em | Size of completion checkbox |

---

## Dark Mode

Dark mode is automatic via `prefers-color-scheme: dark`. The color tokens are overridden in `tokens.css` inside a media query. To change dark mode colors, edit the values in that `@media (prefers-color-scheme: dark)` block.

---

## Component Map

| Class | Element | Purpose |
|-------|---------|---------|
| `.todo-app` | Wrapper div | Main app container |
| `.todo-header` | Header | Title section |
| `.todo-title` | h1 | "Todo List" heading |
| `.todo-error` | p | Error message (hidden when empty) |
| `.todo-form` | form | Add-todo form |
| `.todo-input` | input | Text input for new todo |
| `.todo-add` | button | Submit button |
| `.todo-list` | ul | List of todo items |
| `.todo-item` | li | Single todo row |
| `.todo-text` | span | Todo text content |
| `.todo-item.completed` | li | Completed todo (strikethrough + muted) |
| `.todo-delete` | button | Delete button |

---

## HTML Structure

The app structure lives in `index.html`. The main layout is:

```
#app
  .todo-app
    .todo-header
      .todo-title
    #todo-error.todo-error
    #todo-form.todo-form
      .todo-input
      .todo-add (button)
    #todo-list.todo-list
      .todo-item (repeated, dynamically)
        input[type="checkbox"]
        .todo-text
        .todo-delete (button)
```

To change the HTML structure, edit `index.html`. The JavaScript in `src/ui.js` renders todo items into `#todo-list`.
