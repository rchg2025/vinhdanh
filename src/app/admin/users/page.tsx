import { prisma } from "@/lib/prisma";
import UsersClient from "./UsersClient";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      unit: true,
      class: true,
      _count: {
        select: { applications: true }
      }
    }
  });

  const units = await prisma.unit.findMany({
    include: { classes: true },
    orderBy: { name: "asc" },
  });

  return <UsersClient initialUsers={users} units={units} />;
}