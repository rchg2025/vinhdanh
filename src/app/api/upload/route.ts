import { NextResponse } from "next/server";
import { uploadToGoogleDrive } from "@/lib/drive";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "Không tìm thấy file" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToGoogleDrive(file.name, file.type, buffer);

    if (result.success) {
      return NextResponse.json({ url: result.webViewLink, id: result.fileId });
    } else {
      return NextResponse.json({ message: "Lỗi upload file lên Google Drive" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}
