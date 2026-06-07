import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const maxDuration = 60; // Vercel timeout max duration

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { users } = await req.json();

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "Invalid data format or empty array" }, { status: 400 });
    }

    const importedUsers = [];
    const errors = [];

    // Lấy danh sách email hiện tại để kiểm tra trùng lặp
    const existingEmails = new Set(
      (await prisma.user.findMany({ select: { email: true } })).map((u) => u.email)
    );

    // Lấy danh sách đơn vị và lớp để đối chiếu
    const dbUnits = await prisma.unit.findMany({ include: { classes: true } });

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const { name, email, studentId, password, unitName, className } = user;

      if (!email || !unitName || !className) {
        errors.push(`Row ${i + 1}: Thiếu email, đơn vị hoặc lớp`);
        continue;
      }

      if (existingEmails.has(email)) {
        errors.push(`Row ${i + 1}: Email ${email} đã tồn tại`);
        continue;
      }

      const unit = dbUnits.find(u => u.name.toLowerCase() === unitName.trim().toLowerCase());
      if (!unit) {
        errors.push(`Row ${i + 1}: Đơn vị '${unitName}' không tồn tại trong hệ thống`);
        continue;
      }

      const cls = unit.classes.find(c => c.name.toLowerCase() === className.trim().toLowerCase());
      if (!cls) {
        errors.push(`Row ${i + 1}: Lớp '${className}' không tồn tại trong đơn vị '${unitName}'`);
        continue;
      }

      try {
        const hashedPassword = password ? await bcrypt.hash(password.toString(), 10) : undefined;

        const newUser = await prisma.user.create({
          data: {
            name: name ? name.toString() : null,
            email: email.toString(),
            studentId: studentId ? studentId.toString() : null,
            password: hashedPassword,
            unitId: unit.id,
            classId: cls.id,
            role: "USER",
          },
          include: {
            unit: { select: { name: true } },
            class: { select: { name: true } }
          }
        });

        existingEmails.add(email.toString());
        importedUsers.push(newUser);
      } catch (err: any) {
        errors.push(`Row ${i + 1}: Lỗi khi tạo user ${email} - ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã import thành công ${importedUsers.length} tài khoản. Lỗi: ${errors.length}`,
      importedCount: importedUsers.length,
      errors,
      importedUsers,
    });
  } catch (error: any) {
    console.error("Import Users Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
