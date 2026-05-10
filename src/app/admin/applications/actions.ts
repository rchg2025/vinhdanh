"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function deleteApplication(id: string) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if admin
    if (!session || session.user?.role !== "ADMIN") {
      return { success: false, message: "Không có quyền thực hiện chức năng này" };
    }

    await prisma.application.delete({
      where: { id }
    });

    revalidatePath("/", "layout");
    return { success: true, message: "Đã xóa hồ sơ thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa hồ sơ:", error);
    return { success: false, message: "Có lỗi xảy ra khi xóa hồ sơ" };
  }
}
