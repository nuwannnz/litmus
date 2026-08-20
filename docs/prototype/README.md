# Litmus — clickable prototype

An interactive HTML/CSS/JS prototype built from `docs/ui-design.pen`. No build step,
no dependencies — open `index.html` in a browser.

```
open docs/prototype/index.html
```

## Files

| File | What's in it |
| --- | --- |
| `index.html` | Landing page |
| `login.html` · `register.html` · `forgot.html` | Auth screens (any submit signs you in) |
| `app.html` | The workspace — Week, Projects, Notes |
| `css/tokens.css` | Design tokens as CSS variables, light + dark |
| `css/base.css` | Reset, typography, shared primitives (buttons, chips, modals…) |
| `css/app.css` | Workspace layouts |
| `css/marketing.css` | Landing + auth |
| `js/data.js` | Seed content — tasks, projects, notes |
| `js/app.js` | Workspace behaviour |
| `js/icons.js` | Shared SVG sprite |
| `js/site.js` | Landing + auth behaviour |

State lives in memory, so a reload restores the pristine seed data. That's deliberate:
every demo starts from the same screen.

## A demo path that shows the most

1. **Landing → Get started** drops you on the Week board.
2. **Click a task card** — the detail panel slides in. Change its status, tick a
   subtask, retitle it inline, change the date.
3. **Drag a card between days.** The day counts and the header total follow.
4. **"Add a task"** at the foot of any column opens an inline composer.
5. **Projects → New Project** — name it, pick a colour, add tasks, create. The new
   card appears at the front of the grid.
6. **Open Design System → Board tab** and drag a task between To Do / In Progress /
   Done. Progress and "8 of 12 tasks done" update live.
7. **Notes** — expand the tree, open *Components*, tick a checkbox, select text to
   get the formatting toolbar. The body is editable.
8. **⌘K** anywhere for the command palette.
9. **Toggle dark mode** from the rail (or press `D`).
10. **Narrow the window below 860px** for the phone layout: day pills, one day at a
    time, bottom tab bar.

## Keyboard

| Key | Action |
| --- | --- |
| `⌘K` / `Ctrl+K` | Command palette |
| `1` `2` `3` | Week · Projects · Notes |
| `←` `→` | Previous / next week (on the Week board) |
| `N` | New task on today |
| `D` | Toggle dark mode |
| `Esc` | Close panel, modal, palette or composer |

## Known edges

This is a prototype, not an application:

- Nothing persists across a reload, and there is no backend.
- Auth accepts anything — the forms are wired straight through to `app.html`.
- Time fields on a task are display-only; date, status, category, project,
  priority and subtasks are all editable.
- Moving to an adjacent week shows an empty board. That is intentional — it is the
  quickest way to demo the empty state. **Today** brings you back.
