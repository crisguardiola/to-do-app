# Refactoring suggestions for designers

Suggestions to clean up the codebase, clarify structure, and make it easier for a designer to work in.

---

## 1. **Move the initial HTML out of JavaScript**

**Current:** The whole app shell (header, form, list) is built in `main.js` as a template string (lines 110–122). To change structure or copy, you have to edit JavaScript and escape quotes.

**Suggestion:** Put the app shell in `index.html` so the full page is visible in one place. For example, replace the single `<div id="app"></div>` with the full todo-app markup and keep only the dynamic list (and maybe error message) for JS to fill. Designers can then edit layout and text in HTML and use the browser inspector without touching JS.

**Alternative:** If you prefer a single “app mount”, add a small `src/templates/appShell.js` (or `.html` loaded as text) that only exports the HTML string, so structure lives in one dedicated file.

---

## 2. **Split `main.js` into small modules**

**Current:** One file handles Supabase calls, error/loading UI, DOM updates, event wiring, and initial render. That makes it harder to find “where do I change the form?” vs “where is data saved?”.

**Suggestion:** Split into something like:

- **`src/data/todos.js`** – `fetchTodos`, `addTodo`, `toggleTodo`, `deleteTodo` (all Supabase logic). No DOM.
- **`src/ui/errors.js`** – `setError`, `clearError`, and optionally a single “show message” helper.
- **`src/ui/dom.js`** – `renderTodos`, `setLoading`, and any other DOM updates. This is the file a designer would open to change how the list or form looks in code.
- **`src/main.js`** – Imports the above, wires events (form submit, checkbox, delete), and runs initial load. Stays short and readable.

Designers can then go straight to `ui/dom.js` or CSS for visual changes and avoid scrolling through data logic.

---

## 3. **Document design tokens and where to change styles**

**Current:** `style.css` has a clear `:root` section (colors, spacing, typography, radius) and component classes. There’s no short guide for “change primary color” or “adjust spacing”.

**Suggestion:** Add a **DESIGN.md** (or STYLE_GUIDE.md) that:

- Lists the main tokens (e.g. `--color-accent`, `--space-md`, `--font-body`) and what they’re used for.
- Maps components to CSS classes (e.g. “Todo list = `.todo-list`, items = `.todo-item`”).
- Says where to edit: “Global tokens = top of `src/style.css`; dark mode = same file, `@media (prefers-color-scheme: dark)`.”

A small **DESIGN.md** has been added to the repo as a starting point.

---

## 4. **Add an empty state**

**Current:** When there are no todos, the list is just an empty `<ul>`. It’s not obvious whether the app is broken or simply empty.

**Suggestion:** In the markup, add a visible “empty state” block (e.g. “No todos yet. Add one above.”) and show/hide it in `renderTodos()` based on `todos.length`. Use a single class (e.g. `.todo-empty-state`) so designers can style it in one place. Keeps the list semantics and improves clarity.

---

## 5. **Consolidate button styles**

**Current:** There’s a generic `button` block at the bottom of `style.css`, and `.todo-form .todo-add` and `.todo-delete` repeat a lot of the same properties (border, padding, font, focus). Changing “all buttons” requires editing multiple selectors.

**Suggestion:** Introduce a base class, e.g. `.btn`, with shared styles (border, padding, font, radius, focus). Then use:

- `.btn` or `.btn-primary` for the Add button
- `.btn.btn-ghost` or `.todo-delete` for the delete button (only overrides: color, hover danger)

Designers get one place for default button look and separate overrides for specific actions.

---

## 6. **Add light section comments in CSS and JS**

**Current:** Few comments. A designer has to guess what a block is for.

**Suggestion:** Add one-line section comments, e.g. in CSS: `/* --- Todo form --- */`, `/* --- Todo list items --- */`; in JS: `// --- Todo data (Supabase) ---`, `// --- Error / loading UI ---`, `// --- Render list ---`, `// --- Event wiring ---`. No need to comment every line—just enough to jump to the right place.

---

## 7. **Optional: group files by role**

**Current:** All source lives in `src/` (flat). `main.js`, `style.css`, and `supabaseClient.js` are mixed.

**Suggestion:** If the app grows, consider:

- `src/js/` or `src/scripts/` – main.js, data modules, ui modules
- `src/css/` – style.css (and later component or token files if you split)
- Keep `supabaseClient.js` at `src/` or under `src/js/` and update the import in `main.js`

Then a designer knows: “Markup/structure = HTML; look and feel = `src/css/`; what the list does = `src/js/ui/`.”

---

## 8. **Consistent naming: “completed” vs “is-completed”**

**README** mentions todo values including `is-completed`; the code and DB use `completed`. For less confusion, stick to one name everywhere (code, DB, README). Designers reading the README will then match what they see in the app and in the code.

---

## Summary

| Priority | Suggestion | Benefit for designers |
|----------|------------|------------------------|
| High     | Move initial HTML to `index.html` (or a template file) | Edit structure and copy in HTML, not in JS strings |
| High     | Split `main.js` into data / ui / main | Find “where to change the list/form” quickly |
| High     | Add DESIGN.md (or style guide) | Know which tokens and classes to tweak |
| Medium   | Add empty state | Clear feedback when there are no todos |
| Medium   | Consolidate button styles (`.btn` base) | One place to change default button look |
| Low      | Section comments in CSS/JS | Navigate files by purpose |
| Low      | Optional folder structure | Clear separation of markup, styles, logic |

Implementing 1–3 and the empty state (4) will already make the project much easier to work in as a designer; the rest can be done gradually.
