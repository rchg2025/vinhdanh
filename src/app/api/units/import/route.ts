import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60; // Vercel timeout max duration

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { items } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid data format or empty array" }, { status: 400 });
    }

    const importedUnits = new Set<string>();
    const importedClasses = new Set<string>();
    const errors: string[] = [];

    // Pre-fetch all units and classes to avoid many DB calls
    const allUnits = await prisma.unit.findMany({ include: { classes: true } });
    const unitMap = new Map(allUnits.map(u => [u.name.trim().toLowerCase(), u]));

    for (let i = 0; i < items.length; i++) {
      const { unitName, className } = items[i];

      if (!unitName) {
        errors.push(`Row ${i + 1}: Thiếu tên đơn vị`);
        continue;
      }

      const unitKey = unitName.trim().toLowerCase();
      let unit = unitMap.get(unitKey);

      if (!unit) {
        // Create unit
        try {
          unit = await prisma.unit.create({
            data: { name: unitName.trim() },
            include: { classes: true }
          });
          unitMap.set(unitKey, unit);
          importedUnits.add(unit.id);
        } catch (err: any) {
          errors.push(`Row ${i + 1}: Lỗi tạo đơn vị ${unitName} - ${err.message}`);
          continue;
        }
      }

      if (className) {
        const classKey = className.trim().toLowerCase();
        const existingClass = unit.classes.find(c => c.name.trim().toLowerCase() === classKey);

        if (!existingClass) {
          try {
            const newClass = await prisma.class.create({
              data: {
                name: className.trim(),
                unitId: unit.id
              }
            });
            unit.classes.push(newClass);
            importedClasses.add(newClass.id);
          } catch (err: any) {
            errors.push(`Row ${i + 1}: Lỗi tạo lớp ${className} - ${err.message}`);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã import thành công. Tạo mới ${importedUnits.size} đơn vị, ${importedClasses.size} lớp.`,
      errors,
    });
  } catch (error: any) {
    console.error("Import Units/Classes Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
