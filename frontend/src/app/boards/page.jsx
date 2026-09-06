"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";
import { Plus, Search, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { boardService } from "@/services/board.service";

import BoardCard from "@/components/board/BoardCard";
import BoardForm from "@/components/board/BoardForm";
import Modal from "@/components/common/Modal";
import Spinner from "@/components/common/Spinner";
import EmptyState from "@/components/common/EmptyState";

function BoardsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, loading: authLoading, logout } = useAuth();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (searchParams.get("accessDenied") === "true") {
      toast.error("You don't have access to this board");

      router.replace("/boards");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!authLoading && user) {
      setLoading(true);

      boardService
        .getBoards()
        .then(setBoards)
        .catch((e) => {
          if (e.status === 401 || e.status === 403) {
            return;
          }

          toast.error(
            e.message || "Something went wrong",
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [authLoading, user]);

  const filtered = boards.filter((b) =>
    b.title
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  async function createBoard(title) {
    try {
      const board = await boardService.createBoard({
        title,
      });

      setBoards((v) => [board, ...v]);
      setOpen(false);

      toast.success("Board created");
    } catch (e) {
      toast.error(
        e.message || "Something went wrong",
      );
    }
  }

  if (authLoading || loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Mini Kanban
            </p>

            <h1 className="mt-1 text-xl font-bold text-slate-900">
              Your boards
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user.name}
              </p>

              <p className="text-xs text-slate-500">
                {user.email}
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Projects
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create, organize and collaborate on your work.
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            <Plus size={18} />
            New board
          </button>
        </div>

        <div className="relative mt-7 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search boards..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-indigo-500 focus:ring-2"
          />
        </div>

        {filtered.length ? (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onOpen={() =>
                  router.push(
                    `/boards/${board.id}`,
                  )
                }
                onDeleted={(id) =>
                  setBoards((v) =>
                    v.filter(
                      (b) => b.id !== id,
                    ),
                  )
                }
                onUpdated={(updated) =>
                  setBoards((v) =>
                    v.map((b) =>
                      b.id === updated.id
                        ? {
                            ...b,
                            ...updated,
                          }
                        : b,
                    ),
                  )
                }
              />
            ))}
          </div>
        ) : (
          <div className="mt-7">
            <EmptyState
              title="No boards found"
              description={
                query
                  ? "Try another search."
                  : "Create your first board to get started."
              }
              action={
                !query
                  ? {
                      label: "Create board",
                      onClick: () =>
                        setOpen(true),
                    }
                  : undefined
              }
            />

            {!query && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    router.push("/")
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                  <ArrowLeft size={17} />
                  Back to Home
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <Modal
        open={open}
        title="Create board"
        onClose={() => setOpen(false)}
      >
        <BoardForm
          onSubmit={createBoard}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </main>
  );
}

export default function BoardsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <BoardsPageContent />
    </Suspense>
  );
}