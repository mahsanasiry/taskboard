"use client";

import { useEffect, useReducer, useState } from "react";
import Column from "./Column";
import TaskDialog, { type DialogState } from "./TaskDialog";
import { boardReducer, createId, findTask, initialBoard, loadBoard, saveBoard } from "@/lib/board";
import {
  COLUMNS,
  COLUMN_IDS,
  columnTitle,
  type ColumnId,
  type DropTarget,
  type Priority,
  type Task,
  type TaskValues,
} from "@/lib/types";

export default function Board() {
  const [state, dispatch] = useReducer(boardReducer, initialBoard);
  const [loaded, setLoaded] = useState(false);

  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");

  const [dialog, setDialog] = useState<DialogState>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<DropTarget | null>(null);
  const [announcement, setAnnouncement] = useState("");

  // Load saved tasks once, after the first render (localStorage does not exist on the server).
  useEffect(() => {
    const saved = loadBoard();
    if (saved) dispatch({ type: "load", state: saved });
    setLoaded(true);
  }, []);

  // Save every change, but only after the saved data has been loaded.
  useEffect(() => {
    if (loaded) saveBoard(state);
  }, [state, loaded]);

  // ── Search and filter ──────────────────────────────────────
  const q = query.trim().toLowerCase();
  const matches = (task: Task) =>
    (priorityFilter === "all" || task.priority === priorityFilter) &&
    (q === "" || task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q));

  const total = COLUMN_IDS.reduce((sum, id) => sum + state.columns[id].length, 0);
  const done = state.columns.done.length;
  const percentDone = total === 0 ? 0 : Math.round((done / total) * 100);

  // ── Actions ────────────────────────────────────────────────
  function moveTask(id: string, to: ColumnId, beforeId: string | null) {
    const task = findTask(state, id);
    dispatch({ type: "move", id, to, beforeId });
    if (task) setAnnouncement(`Moved "${task.title}" to ${columnTitle(to)}.`);
  }

  function handleSave(current: NonNullable<DialogState>, values: TaskValues) {
    if (current.mode === "add") {
      dispatch({
        type: "add",
        columnId: current.columnId,
        task: { id: createId(), createdAt: Date.now(), ...values },
      });
      setAnnouncement(`Added "${values.title}" to ${columnTitle(current.columnId)}.`);
    } else {
      dispatch({ type: "update", task: { ...current.task, ...values } });
      setAnnouncement(`Saved changes to "${values.title}".`);
    }
    setDialog(null);
  }

  function handleDelete(task: Task) {
    if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      dispatch({ type: "delete", id: task.id });
      setAnnouncement(`Deleted "${task.title}".`);
    }
  }

  function handleReset() {
    if (window.confirm("Replace all tasks with the sample tasks? This cannot be undone.")) {
      dispatch({ type: "reset" });
      setAnnouncement("Board reset to the sample tasks.");
    }
  }

  // ── Drag and drop ──────────────────────────────────────────
  function handleDragOver(target: DropTarget) {
    // dragover fires many times a second, so only update state when the target changes.
    setOver((prev) =>
      prev && prev.columnId === target.columnId && prev.beforeId === target.beforeId ? prev : target,
    );
  }

  function handleDrop(columnId: ColumnId) {
    if (dragId) {
      const beforeId = over && over.columnId === columnId ? over.beforeId : null;
      moveTask(dragId, columnId, beforeId);
    }
    setDragId(null);
    setOver(null);
  }

  function handleDragEnd() {
    setDragId(null);
    setOver(null);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Taskboard</h1>
          <p className="mt-2 max-w-md text-slate-600">
            Plan your work in three columns. Drag a task to move it. Everything is saved in this
            browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label htmlFor="search" className="sr-only">
              Search tasks
            </label>
            <input
              id="search"
              type="search"
              placeholder="Search tasks"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-48 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400"
            />
          </div>
          <div>
            <label htmlFor="priority-filter" className="sr-only">
              Filter by priority
            </label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority | "all")}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All priorities</option>
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset sample data
          </button>
        </div>
      </header>

      <div className="mt-8">
        <div className="flex items-baseline justify-between text-sm text-slate-700">
          <p>
            <span className="font-semibold tabular-nums">{done}</span> of{" "}
            <span className="font-semibold tabular-nums">{total}</span> tasks done
          </p>
          <p className="tabular-nums">{percentDone}%</p>
        </div>
        <div
          role="progressbar"
          aria-label="Share of tasks that are done"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentDone}
          className="mt-2 h-2 overflow-hidden rounded bg-slate-200"
        >
          <div className="h-full bg-emerald-600" style={{ width: `${percentDone}%` }} />
        </div>
      </div>

      <div className="mt-8 grid items-start gap-5 md:grid-cols-3">
        {COLUMNS.map((column) => (
          <Column
            key={column.id}
            column={column}
            tasks={state.columns[column.id].filter(matches)}
            total={state.columns[column.id].length}
            dragId={dragId}
            over={over}
            onAdd={() => setDialog({ mode: "add", columnId: column.id })}
            onEdit={(task) => setDialog({ mode: "edit", columnId: column.id, task })}
            onDelete={handleDelete}
            onMove={(id, to) => moveTask(id, to, null)}
            onDragStart={setDragId}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          />
        ))}
      </div>

      <TaskDialog state={dialog} onSave={handleSave} onClose={() => setDialog(null)} />

      {/* Screen readers announce changes made with the mouse or keyboard. */}
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
