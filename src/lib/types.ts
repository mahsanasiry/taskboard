export const COLUMNS = [
  {
    id: "todo",
    title: "To do",
    accent: "border-t-slate-400",
    empty: "Nothing planned yet. Add a task to get started.",
  },
  {
    id: "doing",
    title: "In progress",
    accent: "border-t-blue-600",
    empty: "Nothing in progress. Drag a task here when you start it.",
  },
  {
    id: "done",
    title: "Done",
    accent: "border-t-emerald-600",
    empty: "Finished tasks land here.",
  },
] as const;

export type Column = (typeof COLUMNS)[number];
export type ColumnId = Column["id"];
export const COLUMN_IDS: ColumnId[] = COLUMNS.map((c) => c.id);

export function columnTitle(id: ColumnId): string {
  return COLUMNS.find((c) => c.id === id)?.title ?? id;
}

export type Priority = "low" | "medium" | "high";

// Priority is shown with a colored edge AND a text label, so color is never the only signal.
export const PRIORITIES: Record<Priority, { label: string; bar: string; badge: string }> = {
  high: { label: "High", bar: "border-l-rose-500", badge: "bg-rose-50 text-rose-800" },
  medium: { label: "Medium", bar: "border-l-amber-500", badge: "bg-amber-50 text-amber-900" },
  low: { label: "Low", bar: "border-l-slate-300", badge: "bg-slate-100 text-slate-700" },
};

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null; // "YYYY-MM-DD"
  createdAt: number;
}

export interface BoardState {
  columns: Record<ColumnId, Task[]>;
}

export interface DropTarget {
  columnId: ColumnId;
  beforeId: string | null; // insert before this task; null means "at the end"
}

export interface TaskValues {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
}
