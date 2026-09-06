"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import Modal from "@/components/common/Modal";
import TaskForm from "./TaskForm";

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [menu, setMenu] = useState(false);
  const [edit, setEdit] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <article
        ref={setNodeRef}
        style={style}
        className={`group rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm ${
          isDragging
            ? "z-20 opacity-60 shadow-xl ring-2 ring-indigo-200"
            : ""
        }`}
      >
        <div className="flex gap-2">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 cursor-grab touch-none rounded-md p-1 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing"
            aria-label="Drag task"
          >
            <GripVertical size={16} />
          </button>

          <div className="min-w-0 flex-1">
            {/* Title + menu */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="break-words text-sm font-semibold text-slate-800">
                {task.title}
              </h3>

              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setMenu((value) => !value)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
                  aria-label="Task menu"
                >
                  <MoreHorizontal size={16} />
                </button>

                {menu && (
                  <div className="absolute right-0 z-20 mt-1 w-32 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setEdit(true);
                        setMenu(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs hover:bg-slate-50"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        onDelete(task.id);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p className="mt-1.5 whitespace-pre-wrap text-xs leading-5 text-slate-500">
                {task.description}
              </p>
            )}

            <div className="mt-3 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Task
            </div>
          </div>
        </div>
      </article>

      {/* Edit modal */}
      <Modal
        open={edit}
        title="Edit task"
        onClose={() => setEdit(false)}
      >
        <TaskForm
          initialTask={task}
          onSubmit={async (data) => {
            await onUpdate(task.id, data);
            setEdit(false);
          }}
          onCancel={() => setEdit(false)}
        />
      </Modal>
    </>
  );
}