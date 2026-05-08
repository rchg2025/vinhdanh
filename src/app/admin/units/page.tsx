import { prisma } from "@/lib/prisma";
import UnitsClient from "./UnitsClient";

export default async function AdminUnitsPage() {
  const units = await prisma.unit.findMany({
    include: { classes: true },
    orderBy: { createdAt: "desc" },
  });

  return <UnitsClient initialUnits={units} />;
}