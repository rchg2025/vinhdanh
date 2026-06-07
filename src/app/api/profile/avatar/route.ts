import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToGoogleDrive } from "@/lib/drive";

export const maxDuration = 60; // 60s timeout for Vercel

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file tải lên" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Google Drive
    const uploadRes = await uploadToGoogleDrive(
      `avatar_${session.user.id}_${Date.now()}_${file.name}`,
      file.type,
      buffer
    );

    if (!uploadRes.success || !uploadRes.fileId) {
      throw new Error("Lỗi khi tải ảnh lên Google Drive: " + JSON.stringify(uploadRes.error));
    }

    // Google Drive URL to view image directly
    const imageUrl = `https://drive.google.com/thumbnail?id=${uploadRes.fileId}&sz=w400`;

    // Update user profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json({ success: true, imageUrl });
  } catch (error: any) {
    console.error("Avatar Upload Error:", error);
    return NextResponse.json({ error: error.message || "Gặp lỗi nội bộ Server" }, { status: 500 });
  }
}
