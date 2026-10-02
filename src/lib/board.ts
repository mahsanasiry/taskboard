import { COLUMN_IDS, type BoardState, type ColumnId, type Task } from "./types";

export const STORAGE_KEY = "taskboard:v1";

export const initialBoard: BoardState = {
  columns: {
    todo: [
      {
        id: "sample-1",
        title: "Design the landing page hero",
        description: "Sketch two layouts and pick one before building.",
        priority: "high",
        dueDate: null,
        createdAt: 1,
      },
      {
        id: "sample-2",
        title: "Write the project README",
        description: "Add screenshots, setup steps and the live link.",
        priority: "medium",
        dueDate: null,
        createdAt: 2,
      },
    ],
    doing: [
      {
        id: "sample-3",
        title: "Set up GitHub Pages deployment",
        description: "Use the GitHub Actions workflow and check the live URL.",
        priority: "medium",
        dueDate: null,
        createdAt: 3,
      },
    ],
    done: [
      {
        id: "sample-4",
        title: "Create the Next.js project",
        description: "",
        priority: "low",
        dueDate: null,
        createdAt: 4,
      },
    ],
  },
};

export type Action =
  | { type: "load"; state: BoardState }
  | { type: "add"; columnId: ColumnId; task: Task }
  | { type: "update"; task: Task }
  | { type: "delete"; id: string }
  | { type: "move"; id: string; to: ColumnId; beforeId: string | null }
  | { type: "reset" };

export function boardReducer(state: BoardState, action: Action): BoardState {
  switch (action.type) {
    case "load":
      return action.state;

    case "reset":
      return initialBoard;

    case "add":
      return {
        columns: {
          ...state.columns,
          [action.columnId]: [...state.columns[action.columnId], action.task],
        },
      };

    case "update": {
      const columns = {} as Record<ColumnId, Task[]>;
      for (const id of COLUMN_IDS) {
        columns[id] = state.columns[id].map((t) => (t.id === action.task.id ? action.task : t));
      }
      return { columns };
    }

    case "delete": {
      const columns = {} as Record<ColumnId, Task[]>;
      for (const id of COLUMN_IDS) {
        columns[id] = state.columns[id].filter((t) => t.id !== action.id);
      }
      return { columns };
    }

    case "move": {
      // Dropping a task onto itself changes nothing.
      if (action.beforeId === action.id) return state;

      const moving = findTask(state, action.id);
      if (!moving) return state;

      const columns = {} as Record<ColumnId, Task[]>;
      for (const id of COLUMN_IDS) {
        columns[id] = state.columns[id].filter((t) => t.id !== action.id);
      }

      const target = columns[action.to];
      const index = action.beforeId ? target.findIndex((t) => t.id === action.beforeId) : -1;
      if (index === -1) {
        target.push(moving);
      } else {
        target.splice(index, 0, moving);
      }
      return { columns };
    }

    default:
      return state;
  }
}

export function findTask(state: BoardState, id: string): Task | undefined {
  for (const columnId of COLUMN_IDS) {
    const found = state.columns[columnId].find((t) => t.id === id);
    if (found) return found;
  }
  return undefined;
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ── Saving in the browser (localStorage) ─────────────────────

export function loadBoard(): BoardState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BoardState>;
    const columns = parsed.columns;
    if (!columns || !COLUMN_IDS.every((id) => Array.isArray(columns[id]))) return null;
    return { columns };
  } catch {
    return null;
  }
}

export function saveBoard(state: BoardState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be full or blocked (private mode). The board still works for this visit.
  }
}

// ── Dates ────────────────────────────────────────────────────

export function todayISO(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export function formatDue(dueDate: string): string {
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
