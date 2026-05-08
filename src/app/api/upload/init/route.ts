import { NextResponse } from "next/server";
import { createResumableSession } from "@/lib/drive";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { fileName, mimeType, origin } = await req.json();

    if (!fileName || !mimeType || !origin) {
      return NextResponse.json({ message: "Thiếu tham số" }, { status: 400 });
    }

    const result = await createResumableSession(fileName, mimeType, origin);

    if (result.success) {
      return NextResponse.json({ uploadUrl: result.uploadUrl });
    } else {
      return NextResponse.json({ message: "Lỗi khởi tạo upload Google Drive" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}