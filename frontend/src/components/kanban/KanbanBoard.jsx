"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";
import Modal from "@/components/common/Modal";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";

export default function KanbanBoard({
  board,
  onCreateColumn,
  creatingColumn,
  onUpdateColumn,
  onDeleteColumn,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
}) {
  const [activeTask, setActiveTask] = useState(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  const [localColumns, setLocalColumns] = useState(board.columns);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  useEffect(() => {
    setLocalColumns(board.columns);
  }, [board.columns]);

  function findTask(id) {
    return localColumns.flatMap((c) => c.tasks).find((t) => t.id === id);
  }

  function findColumnByTask(id) {
    return localColumns.find((c) =>
      c.tasks.some((t) => t.id === id),
    );
  }

  function findColumn(id) {
    return localColumns.find((c) => c.id === id);
  }

  function handleDragStart({ active }) {
    setActiveTask(findTask(active.id));
  }

  function handleDragCancel() {
    setActiveTask(null);
    setLocalColumns(board.columns);
  }

  async function handleDragEnd({ active, over }) {
    setActiveTask(null);

    if (!over) return;

    const task = findTask(active.id);

    if (!task) return;

    const source = findColumnByTask(task.id);

    let targetId = String(over.id).startsWith("column-")
      ? String(over.id).replace("column-", "")
      : findColumnByTask(over.id)?.id;

    if (!targetId) {
      targetId = source?.id;
    }

    const target = findColumn(targetId);

    if (!source || !target) return;

    let targetIndex = target.tasks.findIndex(
      (t) => t.id === over.id,
    );

    if (targetIndex < 0) {
      targetIndex = target.tasks.length;
    }

    if (source.id === target.id) {
      const oldIndex = source.tasks.findIndex(
        (t) => t.id === task.id,
      );

      if (oldIndex === targetIndex) return;

      const newTasks = arrayMove(
        source.tasks,
        oldIndex,
        targetIndex,
      );

      setLocalColumns(
        localColumns.map((c) =>
          c.id === source.id
            ? {
                ...c,
                tasks: newTasks.map((t, i) => ({
                  ...t,
                  position: i,
                })),
              }
            : c,
        ),
      );

      try {
        await onMoveTask(
          task.id,
          source.id,
          targetIndex,
        );
      } catch (e) {
        toast.error(e.message);
        setLocalColumns(board.columns);
      }

      return;
    }

    const newPos = targetIndex;

    setLocalColumns(
      localColumns.map((c) =>
        c.id === source.id
          ? {
              ...c,
              tasks: c.tasks
                .filter((t) => t.id !== task.id)
                .map((t, i) => ({
                  ...t,
                  position: i,
                })),
            }
          : c.id === target.id
            ? {
                ...c,
                tasks: [
                  ...c.tasks.slice(0, newPos),
                  task,
                  ...c.tasks.slice(newPos),
                ].map((t, i) => ({
                  ...t,
                  position: i,
                })),
              }
            : c,
      ),
    );

    try {
      await onMoveTask(
        task.id,
        target.id,
        newPos,
      );
    } catch (e) {
      toast.error(e.message);
      setLocalColumns(board.columns);
    }
  }

  async function addColumn(e) {
    e.preventDefault();

    if (!title.trim() || creatingColumn) return;

    await onCreateColumn(title.trim());

    setTitle("");
    setOpen(false);
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto">
          <div className="mx-auto flex min-h-[calc(100vh-74px)] w-max max-w-[1500px] gap-4 px-4 py-5 sm:px-6">
            <div className="flex items-start gap-4">
              {localColumns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  onCreateTask={onCreateTask}
                  onUpdateTask={onUpdateTask}
                  onDeleteTask={onDeleteTask}
                  onUpdateColumn={onUpdateColumn}
                  onDeleteColumn={onDeleteColumn}
                />
              ))}

              <button
                type="button"
                disabled={creatingColumn}
                onClick={() => setOpen(true)}
                className="flex h-14 w-[310px] shrink-0 items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white/60 text-sm font-semibold text-slate-500 hover:border-indigo-300 hover:bg-white hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingColumn ? (
                  <>
                    <Spinner size="sm" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Add column
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-[290px] rotate-2">
              <TaskCard
                task={activeTask}
                onUpdate={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Modal
        open={open}
        title="Add column"
        onClose={() => {
          if (!creatingColumn) {
            setOpen(false);
          }
        }}
      >
        <form onSubmit={addColumn} className="space-y-4">
          <Input
            label="Column title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Review"
            autoFocus
            required
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={creatingColumn}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={creatingColumn}>
              {creatingColumn ? (
                <>
                  <Spinner size="sm" />
                  Adding...
                </>
              ) : (
                "Add column"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}