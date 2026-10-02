# Taskboard: a Kanban board in React and TypeScript

A fast Kanban task board with three columns (To do, In progress, Done).
Built with **Next.js 14**, **TypeScript** and **Tailwind CSS**, exported as a static site.
No backend and no extra libraries: tasks are saved in the browser with `localStorage`.

## Features

- Add, edit and delete tasks (title, details, priority, due date)
- Drag and drop between columns and reorder inside a column (native HTML5 drag and drop)
- "Move to" menu on every card for phones and keyboard users
- Search and priority filter
- Overdue dates highlighted, progress bar for finished tasks
- Saved automatically in the browser
- Accessible: native `<dialog>` for the task form, ARIA labels, live announcements, visible focus

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
```

The static site is created in the `out` folder.

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings > Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml` and publishes the site at
   `https://mahsanasiry.github.io/taskboardr/`.

## Project structure

```
src/
  app/          layout, page, global styles
  components/   Board, Column, TaskCard, TaskDialog
  lib/
    types.ts    types and constants (columns, priorities)
    board.ts    reducer (all state changes), saving and loading, helpers
```
