import { NextResponse } from "next/server";
import { listDriveFiles } from "@/lib/googleDrive";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");

    if (!folderId) {
      return NextResponse.json(
        { error: "folderId がありません" },
        { status: 400 }
      );
    }

    const files = await listDriveFiles(folderId);

    return NextResponse.json(files ?? []);
  } catch (error) {
    console.error("Drive list error:", error);

    return NextResponse.json(
      { error: "Google Driveの写真一覧取得に失敗しました" },
      { status: 500 }
    );
  }
}