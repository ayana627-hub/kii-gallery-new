import sharp from "sharp";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get("key");
    const size = request.nextUrl.searchParams.get("size") ?? "original";
    const bucketName = process.env.R2_BUCKET_NAME;

    if (!key) {
      return NextResponse.json(
        { error: "ダウンロードする写真が指定されていません" },
        { status: 400 }
      );
    }

    if (
      !process.env.R2_ENDPOINT ||
      !process.env.R2_ACCESS_KEY_ID ||
      !process.env.R2_SECRET_ACCESS_KEY ||
      !bucketName
    ) {
      return NextResponse.json(
        { error: "R2の環境変数が設定されていません" },
        { status: 500 }
      );
    }

    const result = await r2.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );

    if (!result.Body) {
      return NextResponse.json(
        { error: "写真データが見つかりません" },
        { status: 404 }
      );
    }


const bytes = await result.Body.transformToByteArray();
const fileName = key.split("/").pop() ?? "photo.jpg";

let downloadData: Buffer<ArrayBufferLike> = Buffer.from(bytes);
let downloadName = fileName;
let contentType = result.ContentType ?? "application/octet-stream";

if (size === "large") {
  downloadData = await sharp(downloadData)
    .rotate()
    .resize({
      width: 2048,
      height: 2048,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  downloadName = fileName.replace(/\.[^.]+$/, "") + "_L.jpg";
  contentType = "image/jpeg";
}

return new NextResponse(
  Uint8Array.from(downloadData).buffer,
  {
  status: 200,
  headers: {
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
    "Content-Length": String(downloadData.length),
  },
});

  } catch (error) {
    console.error("R2 download error:", error);

    return NextResponse.json(
      { error: "写真のダウンロードに失敗しました" },
      { status: 500 }
    );
  }
}