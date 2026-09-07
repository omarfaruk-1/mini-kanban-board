"use client";
import { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  ArrowUpRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { boardService } from "@/services/board.service";
import Modal from "@/components/common/Modal";
import BoardForm from "./BoardForm";
export default function BoardCard({ board, onOpen, onDeleted, onUpdated }) {
  const [menu, setMenu] = useState(false);
  const [edit, setEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const owner = board.owner?.name || "Owner";
  async function update(title) {
    const b = await boardService.updateBoard(board.id, { title });
    onUpdated(b);
    setEdit(false);
    toast.success("Board updated");
  }
  async function del() {
    if (!confirm("Delete this board?")) return;
    setDeleting(true);
    try {
      await boardService.deleteBoard(board.id);
      onDeleted(board.id);
      toast.success("Board deleted");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  }
  return (
    <>
      <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="absolute inset-x-0 top-0 h-1 bg-indigo-500" />
        <div className="flex items-start justify-between gap-3">
          <button onClick={onOpen} className="text-left">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600">
              {board.title}
            </h3>
            <p className="mt-1 text-xs text-slate-500">Owned by {owner}</p>
          </button>
          <div className="relative">
            <button
              onClick={() => setMenu((v) => !v)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            >
              <MoreHorizontal size={18} />
            </button>
            {menu && (
              <div className="absolute right-0 z-10 mt-1 w-36 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                <button
                  onClick={() => {
                    setEdit(true);
                    setMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={del}
                  disabled={deleting}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Users size={14} /> {(board.members?.length || 0) + 1} people
          </span>
          <button
            onClick={onOpen}
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600"
          >
            Open <ArrowUpRight size={15} />
          </button>
        </div>
      </article>
      <Modal open={edit} title="Edit board" onClose={() => setEdit(false)}>
        <BoardForm
          initialTitle={board.title}
          onSubmit={update}
          onCancel={() => setEdit(false)}
        />
      </Modal>
    </>
  );
}
