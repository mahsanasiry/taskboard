"use client";

import { Fragment } from "react";
import TaskCard from "./TaskCard";
import type { Column as ColumnDef, ColumnId, DropTarget, Task } from "@/lib/types";

interface ColumnProps {
  column: ColumnDef;
  tasks: Task[]; // tasks that match the current search and filter
  total: number; // all tasks in this column
  dragId: string | null;
  over: DropTarget | null;
  onAdd: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMove: (id: string, to: ColumnId) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOver: (target: DropTarget) => void;
  onDrop: () => void;
}

function DropLine() {
  return <li aria-hidden="true" className="h-1 rounded bg-blue-600" />;
}

export default function Column({
  column,
  tasks,
  total,
  dragId,
  over,
  onAdd,
  onEdit,
  onDelete,
  onMove,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: ColumnProps) {
  const target = over !== null && over.columnId === column.id ? over : null;
  const isOver = target !== null;
  const lastId = tasks.length > 0 ? tasks[tasks.length - 1].id : null;
  const showEndLine = target !== null && target.beforeId === null && lastId !== dragId;
  const filtered = tasks.length !== total;

  return (
    <section
      aria-labelledby={`column-${column.id}`}
      onDragOver={(e) => {
        if (!dragId) return;
        e.preventDefault();
        onDragOver({ columnId: column.id, beforeId: null });
      }}
      onDrop={(e) => {
        if (!dragId) return;
        e.preventDefault();
        onDrop();
      }}
      className={`flex flex-col rounded-lg border-t-4 bg-white/80 p-3 ${column.accent} ${
        isOver ? "ring-2 ring-blue-300" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id={`column-${column.id}`} className="text-lg font-bold text-slate-900">
          {column.title}{" "}
          <span className="ml-1 text-sm font-medium tabular-nums text-slate-500">
            {filtered ? `${tasks.length} of ${total}` : total}
          </span>
        </h2>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Add task
        </button>
      </div>

      <ul className="mt-3 flex min-h-24 flex-1 flex-col gap-2">
        {tasks.map((task, index) => {
          const showLine = target !== null && target.beforeId === task.id && task.id !== dragId;
          return (
            <Fragment key={task.id}>
              {showLine && <DropLine />}
              <li>
                <TaskCard
                  task={task}
                  columnId={column.id}
                  nextId={tasks[index + 1]?.id ?? null}
                  isDragging={dragId === task.id}
                  isDragActive={dragId !== null}
                  onEdit={() => onEdit(task)}
                  onDelete={() => onDelete(task)}
                  onMove={(to) => onMove(task.id, to)}
                  onDragStart={() => onDragStart(task.id)}
                  onDragEnd={onDragEnd}
                  onDragOverCard={(beforeId) => onDragOver({ columnId: column.id, beforeId })}
                />
              </li>
            </Fragment>
          );
        })}
        {showEndLine && <DropLine />}
        {tasks.length === 0 && (
          <li className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            {filtered ? "No tasks match your search or filter." : column.empty}
          </li>
        )}
      </ul>
    </section>
  );
}
