"use client";

import { formatDue, todayISO } from "@/lib/board";
import { COLUMNS, PRIORITIES, type ColumnId, type Task } from "@/lib/types";

interface TaskCardProps {
  task: Task;
  columnId: ColumnId;
  nextId: string | null;
  isDragging: boolean;
  isDragActive: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (to: ColumnId) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOverCard: (beforeId: string | null) => void;
}

export default function TaskCard({
  task,
  columnId,
  nextId,
  isDragging,
  isDragActive,
  onEdit,
  onDelete,
  onMove,
  onDragStart,
  onDragEnd,
  onDragOverCard,
}: TaskCardProps) {
  const priority = PRIORITIES[task.priority];
  const overdue = Boolean(task.dueDate) && columnId !== "done" && task.dueDate! < todayISO();

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        if (!isDragActive) return;
        e.preventDefault();
        e.stopPropagation();
        // Upper half of the card = drop before it. Lower half = drop before the next card.
        const rect = e.currentTarget.getBoundingClientRect();
        const lowerHalf = e.clientY > rect.top + rect.height / 2;
        onDragOverCard(lowerHalf ? nextId : task.id);
      }}
      className={`cursor-grab rounded-md border border-l-4 border-slate-200 bg-white p-3 active:cursor-grabbing ${priority.bar} ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="break-words font-semibold text-slate-900">{task.title}</h3>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit "${task.title}"`}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete "${task.title}"`}
            className="rounded p-1 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="mt-1 line-clamp-3 break-words text-sm text-slate-600">{task.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded px-2 py-0.5 font-medium ${priority.badge}`}>
          {priority.label} priority
        </span>
        {task.dueDate && (
          <span
            className={
              overdue
                ? "rounded bg-rose-600 px-2 py-0.5 font-medium text-white"
                : "rounded bg-slate-100 px-2 py-0.5 text-slate-700"
            }
          >
            {overdue ? "Overdue" : "Due"} {formatDue(task.dueDate)}
          </span>
        )}
      </div>

      {/* Works on phones, where dragging is unreliable, and with a keyboard. */}
      <div className="mt-3">
        <label htmlFor={`move-${task.id}`} className="sr-only">
          Move &quot;{task.title}&quot; to another column
        </label>
        <select
          id={`move-${task.id}`}
          value=""
          onChange={(e) => {
            const to = e.target.value as ColumnId | "";
            if (to) onMove(to);
          }}
          className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
        >
          <option value="" disabled>
            Move to...
          </option>
          {COLUMNS.filter((c) => c.id !== columnId).map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}
