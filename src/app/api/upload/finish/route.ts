import { NextResponse } from "next/server";
import { finishResumableUpload } from "@/lib/drive";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { fileId } = await req.json();

    if (!fileId) {
      return NextResponse.json({ message: "Thiếu fileId" }, { status: 400 });
    }

    const result = await finishResumableUpload(fileId);

    if (result.success) {
      return NextResponse.json({ 
        url: result.webViewLink, 
        id: result.fileId 
      });
    } else {
      return NextResponse.json({ message: "Lỗi hoàn tất upload" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}