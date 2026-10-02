"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { columnTitle, PRIORITIES, type ColumnId, type Priority, type Task, type TaskValues } from "@/lib/types";

export type DialogState =
  | { mode: "add"; columnId: ColumnId }
  | { mode: "edit"; columnId: ColumnId; task: Task }
  | null;

interface TaskDialogProps {
  state: DialogState;
  onSave: (state: NonNullable<DialogState>, values: TaskValues) => void;
  onClose: () => void;
}

const PRIORITY_ORDER: Priority[] = ["low", "medium", "high"];

const fieldClass =
  "mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400";

export default function TaskDialog({ state, onSave, onClose }: TaskDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  // Open or close the native <dialog> when the state changes, and fill in the fields.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (state) {
      const task = state.mode === "edit" ? state.task : null;
      setTitle(task?.title ?? "");
      setDescription(task?.description ?? "");
      setPriority(task?.priority ?? "medium");
      setDueDate(task?.dueDate ?? "");
      setError("");
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [state]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!state) return;

    const trimmed = title.trim();
    if (!trimmed) {
      setError("Enter a title for the task.");
      return;
    }
    onSave(state, {
      title: trimmed,
      description: description.trim(),
      priority,
      dueDate: dueDate || null,
    });
  }

  const heading =
    state?.mode === "edit" ? "Edit task" : `Add task to ${state ? columnTitle(state.columnId) : ""}`;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        // A click on the dark backdrop targets the <dialog> element itself.
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="task-dialog-title"
      className="w-[calc(100%-2rem)] max-w-md rounded-lg p-0 text-slate-900 backdrop:bg-slate-900/50"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5 p-6">
        <h2 id="task-dialog-title" className="text-xl font-bold">
          {heading}
        </h2>

        <div>
          <label htmlFor="task-title" className="font-semibold">
            Title
          </label>
          <input
            id="task-title"
            type="text"
            maxLength={80}
            autoFocus
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError("");
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "task-title-error" : undefined}
            className={fieldClass}
          />
          {error && (
            <p id="task-title-error" className="mt-1 text-sm text-rose-700">
              {error}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="task-description" className="font-semibold">
            Details <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <textarea
            id="task-description"
            rows={3}
            maxLength={300}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={fieldClass}
          />
        </div>

        <fieldset>
          <legend className="font-semibold">Priority</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {PRIORITY_ORDER.map((p) => (
              <label
                key={p}
                className={`cursor-pointer rounded-md border px-3 py-2 text-center text-sm font-medium focus-within:outline focus-within:outline-2 focus-within:outline-blue-600 ${
                  priority === p
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={p}
                  checked={priority === p}
                  onChange={() => setPriority(p)}
                  className="sr-only"
                />
                {PRIORITIES[p].label}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="task-due" className="font-semibold">
            Due date <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700"
          >
            {state?.mode === "edit" ? "Save changes" : "Add task"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
