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

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": result.ContentType ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
          fileName
        )}`,
        "Content-Length": String(bytes.length),
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