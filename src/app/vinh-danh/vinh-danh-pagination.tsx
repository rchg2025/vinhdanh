"use client";

import { useRouter } from "next/navigation";

export default function VinhDanhPagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const router = useRouter();

  const go = (page: number) => {
    router.push(`/vinh-danh?page=${page}`);
  };

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => go(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
      >
        ← Trước
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-gray-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => go(p as number)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
              p === currentPage
                ? "bg-indigo-600 text-white shadow-sm"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => go(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
      >
        Tiếp →
      </button>
    </div>
  );
}
