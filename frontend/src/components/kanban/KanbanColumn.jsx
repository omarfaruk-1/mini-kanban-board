"use client";
import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
export default function KanbanColumn({
  column,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onUpdateColumn,
  onDeleteColumn,
}) {
  const [taskOpen, setTaskOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [menu, setMenu] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { type: "column", columnId: column.id },
  });
  const [title, setTitle] = useState(column.title);
  async function rename(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await onUpdateColumn(column.id, title.trim());
    setEdit(false);
  }
  return (
    <section
      className={`flex w-[310px] shrink-0 flex-col rounded-2xl border bg-slate-50/80 transition ${isOver ? "border-indigo-300 bg-indigo-50/40" : "border-slate-200"}`}
    >
      <div className="flex items-center gap-2 px-3.5 py-3">
        <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
        <h2 className="min-w-0 flex-1 truncate text-sm font-bold text-slate-800">
          {column.title}
        </h2>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
          {column.tasks.length}
        </span>
        <div className="relative">
          <button
            onClick={() => setMenu((v) => !v)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white"
          >
            <MoreHorizontal size={17} />
          </button>
          {menu && (
            <div className="absolute right-0 z-20 mt-1 w-32 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
              <button
                onClick={() => {
                  setEdit(true);
                  setMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs hover:bg-slate-50"
              >
                <Pencil size={13} /> Rename
              </button>
              <button
                onClick={() => onDeleteColumn(column.id)}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs text-red-600 hover:bg-red-50"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div
        ref={setNodeRef}
        className="scrollbar min-h-24 flex-1 space-y-2 overflow-y-auto px-2.5 pb-3"
        style={{ maxHeight: "calc(100vh - 210px)" }}
      >
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>
        {column.tasks.length === 0 && (
          <div className="flex min-h-20 items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
            Drop a task here
          </div>
        )}
      </div>
      <button
        onClick={() => setTaskOpen(true)}
        className="m-2.5 inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
      >
        <Plus size={16} /> Add task
      </button>
      <Modal
        open={taskOpen}
        title={`Add task to ${column.title}`}
        onClose={() => setTaskOpen(false)}
      >
        <TaskForm
          onSubmit={async (data) => {
            await onCreateTask(column.id, data);
            setTaskOpen(false);
          }}
          onCancel={() => setTaskOpen(false)}
        />
      </Modal>
      <Modal open={edit} title="Rename column" onClose={() => setEdit(false)}>
        <form onSubmit={rename} className="space-y-4">
          <Input
            label="Column title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEdit(false)}
            >
              Cancel
            </Button>
            <Button>Save</Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
