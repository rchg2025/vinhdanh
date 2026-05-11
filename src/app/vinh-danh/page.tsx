import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Trophy } from "lucide-react";
import VinhDanhPagination from "./vinh-danh-pagination";

const PER_PAGE = 10;

function getCertThumb(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
  if (m?.[1]) return `/api/proxy-image?url=${encodeURIComponent(`https://drive.google.com/thumbnail?id=${m[1]}&sz=w400`)}`;
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2?.[1]) return `/api/proxy-image?url=${encodeURIComponent(`https://drive.google.com/thumbnail?id=${m2[1]}&sz=w400`)}`;
  return url;
}

export default async function VinhDanhPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || "1"));
  const skip = (page - 1) * PER_PAGE;

  const [total, honorees] = await Promise.all([
    prisma.application.count({ where: { status: "APPROVED" } }),
    prisma.application.findMany({
      where: { status: "APPROVED" },
      include: { user: { select: { name: true, studentId: true } }, campaign: { select: { title: true } } },
      orderBy: { updatedAt: "desc" },
      skip,
      take: PER_PAGE,
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="w-full px-4 md:px-8 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-xl shadow-md flex items-center justify-center w-9 h-9">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">Vinh Danh Online</span>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 font-medium">Gương sáng vinh danh</span>
        </div>
      </header>

      <main className="w-full px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">🌟 Vinh danh gương sáng</h1>
          <p className="text-gray-500 mt-2">Tổng số {total} sinh viên được vinh danh</p>
        </div>

        {honorees.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400">Chưa có sinh viên nào được vinh danh.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {honorees.map((h) => {
              const thumb = getCertThumb(h.certificateUrl);
              return (
                <Link
                  key={h.id}
                  href={`/certificate/${h.id}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt={`Giấy khen ${h.user.name}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300 bg-gray-100"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-5xl">
                      🏆
                    </div>
                  )}
                  <div className="p-3">
                    <p className="font-bold text-gray-900 text-sm truncate">{h.user.name}</p>
                    <p className="text-xs text-indigo-600 font-medium truncate mt-0.5">{h.campaign.title}</p>
                    {h.user.studentId && (
                      <p className="text-xs text-gray-400 mt-0.5">MSSV: {h.user.studentId}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <VinhDanhPagination currentPage={page} totalPages={totalPages} />
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-gray-400 text-sm border-t border-gray-100 mt-8">
        © {new Date().getFullYear()} Đoàn Trường Cao đẳng Bách Khoa Nam Sài Gòn
      </footer>
    </div>
  );
}
