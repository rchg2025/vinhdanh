import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";
import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { unit: true, class: true }
  });

  const units = await prisma.unit.findMany({
    include: { classes: true },
    orderBy: { name: "asc" }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <span className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <UserRound size={20} className="text-indigo-600" /> Hồ sơ cá nhân
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <ProfileClient initialUser={user} units={units} />
      </main>
    </div>
  );
}