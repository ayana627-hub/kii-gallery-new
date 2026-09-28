import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

export async function POST(request: Request) {
  try {
    const bucketName = process.env.R2_BUCKET_NAME;

 const missingEnv = [
  !process.env.R2_ENDPOINT && "R2_ENDPOINT",
  !process.env.R2_ACCESS_KEY_ID && "R2_ACCESS_KEY_ID",
  !process.env.R2_SECRET_ACCESS_KEY && "R2_SECRET_ACCESS_KEY",
  !bucketName && "R2_BUCKET_NAME",
].filter(Boolean);

if (missingEnv.length > 0) {
  return NextResponse.json(
    {
      error: `不足している環境変数: ${missingEnv.join(", ")}`,
      missing: missingEnv,
    },
    { status: 500 }
  );
}

    const formData = await request.formData();

    const file = formData.get("file");
    const folderId = formData.get("folderId");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "写真が選択されていません" },
        { status: 400 }
      );
    }

    if (typeof folderId !== "string" || !folderId) {
      return NextResponse.json(
        { error: "保存先ギャラリーが見つかりません" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const safeFileName = file.name.replace(/[^\w.\-()ぁ-んァ-ヶ一-龠]/g, "_");
    const objectKey = `${folderId}/${Date.now()}-${safeFileName}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      })
    );

    return NextResponse.json({
      success: true,
      file: {
        key: objectKey,
        name: file.name,
        mimeType: file.type,
        size: file.size,
      },
    });
  } catch (error) {
    console.error("R2 upload error:", error);

    return NextResponse.json(
      { error: "R2へのアップロードに失敗しました" },
      { status: 500 }
    );
  }
}