import { NextResponse } from "next/server";
import { createDriveFolder } from "@/lib/googleDrive";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const folderName = body.folderName;

    const folder = await createDriveFolder(folderName);

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Drive folder create error:", error);

    return NextResponse.json(
      { error: "Google Driveフォルダ作成に失敗しました" },
      { status: 500 }
    );
  }
}