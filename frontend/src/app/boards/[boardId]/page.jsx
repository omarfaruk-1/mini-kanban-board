"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { boardService } from "@/services/board.service";
import { columnService } from "@/services/column.service";
import { taskService } from "@/services/task.service";
import { useAuth } from "@/hooks/useAuth";

import KanbanBoard from "@/components/kanban/KanbanBoard";
import BoardHeader from "@/components/board/BoardHeader";
import BoardMembers from "@/components/board/BoardMembers";
import Modal from "@/components/common/Modal";
import Spinner from "@/components/common/Spinner";

export default function BoardDetailsPage() {
  const { boardId } = useParams();
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [membersOpen, setMembersOpen] = useState(false);
  const [creatingColumn, setCreatingColumn] = useState(false);

  const loadedBoardRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !user || !boardId) {
      return;
    }

    // Prevent duplicate board requests in development/StrictMode.
    if (loadedBoardRef.current === boardId) {
      return;
    }

    loadedBoardRef.current = boardId;

    loadBoard();
  }, [authLoading, user, boardId]);

  async function loadBoard() {
    try {
      setLoading(true);

      const data = await boardService.getBoard(boardId);

      setBoard(data);
    } catch (e) {
      if (e.status === 401 || e.status === 403 || e.status === 404) {
        toast.error("You don't have access to this board");
        router.replace("/boards");
        return;
      }

      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function createColumn(title) {
    if (creatingColumn) return;

    try {
      setCreatingColumn(true);

      const column = await columnService.createColumn(boardId, {
        title,
      });

      setBoard((v) => ({
        ...v,
        columns: [
          ...v.columns,
          {
            ...column,
            tasks: [],
          },
        ],
      }));

      toast.success("Column added");
    } catch (e) {
      toast.error(e.message);
      throw e;
    } finally {
      setCreatingColumn(false);
    }
  }

  async function updateColumn(id, title) {
    const column = await columnService.updateColumn(id, {
      title,
    });

    setBoard((v) => ({
      ...v,
      columns: v.columns.map((c) => (c.id === id ? { ...c, ...column } : c)),
    }));
  }

  async function deleteColumn(id) {
    await columnService.deleteColumn(id);

    setBoard((v) => ({
      ...v,
      columns: v.columns.filter((c) => c.id !== id),
    }));

    toast.success("Column deleted");
  }

  async function createTask(columnId, data) {
    const task = await taskService.createTask(columnId, data);

    setBoard((v) => ({
      ...v,
      columns: v.columns.map((c) =>
        c.id === columnId
          ? {
              ...c,
              tasks: [...c.tasks, task],
            }
          : c,
      ),
    }));
  }

  async function updateTask(id, data) {
    const task = await taskService.updateTask(id, data);

    setBoard((v) => ({
      ...v,
      columns: v.columns.map((c) => ({
        ...c,
        tasks: c.tasks.map((t) => (t.id === id ? { ...t, ...task } : t)),
      })),
    }));
  }

  async function deleteTask(id) {
    await taskService.deleteTask(id);

    setBoard((v) => ({
      ...v,
      columns: v.columns.map((c) => ({
        ...c,
        tasks: c.tasks.filter((t) => t.id !== id),
      })),
    }));
  }

  async function moveTask(taskId, targetColumnId, targetPosition) {
    const updated = await taskService.moveTask(taskId, {
      targetColumnId,
      targetPosition,
    });

    setBoard((v) => ({
      ...v,
      columns: v.columns
        .map((c) => ({
          ...c,
          tasks: c.tasks.filter((t) => t.id !== taskId),
        }))
        .map((c) =>
          c.id === updated.columnId
            ? {
                ...c,
                tasks: insertAt(c.tasks, updated, updated.position),
              }
            : c,
        )
        .map((c) => normalizeColumn(c)),
    }));
  }

  if (authLoading || loading || !board) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const isOwner = board.ownerId === user.id;

  return (
    <main className="min-h-screen bg-slate-100">
      <BoardHeader
        board={board}
        isOwner={isOwner}
        onBack={() => router.push("/boards")}
        onRename={async (title) => {
          const b = await boardService.updateBoard(board.id, {
            title,
          });

          setBoard((v) => ({
            ...v,
            ...b,
          }));

          toast.success("Board updated");
        }}
        onDelete={async () => {
          await boardService.deleteBoard(board.id);

          toast.success("Board deleted");
          router.replace("/boards");
        }}
        onMembers={() => setMembersOpen(true)}
      />

      <KanbanBoard
        board={board}
        isOwner={isOwner}
        onCreateColumn={createColumn}
        creatingColumn={creatingColumn}
        onUpdateColumn={updateColumn}
        onDeleteColumn={deleteColumn}
        onCreateTask={createTask}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
        onMoveTask={moveTask}
      />

      <Modal
        open={membersOpen}
        title="Board members"
        onClose={() => setMembersOpen(false)}
      >
        <BoardMembers board={board} isOwner={isOwner} onChanged={loadBoard} />
      </Modal>
    </main>
  );
}

function insertAt(tasks, task, index) {
  const copy = [...tasks];

  copy.splice(Math.max(0, Math.min(index, copy.length)), 0, task);

  return copy;
}

function normalizeColumn(column) {
  return {
    ...column,
    tasks: column.tasks.map((t, i) => ({
      ...t,
      position: i,
    })),
  };
}
