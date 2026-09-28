import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { zipSync } from "fflate";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[\\/:*?"<>|]/g, "_");
}

function getOriginalFileName(key: string) {
  const storedName = key.split("/").pop() ?? "photo.jpg";

  return sanitizeFileName(
    storedName.replace(/^\d+-/, "")
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const galleryId = searchParams.get("galleryId");

    if (!galleryId) {
  return NextResponse.json(
    { error: "galleryIdがありません" },
    { status: 400 }
  );
}

    const bucketName = process.env.R2_BUCKET_NAME;

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

    const list = await r2.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: `${galleryId}/`,
      })
    );

    const objects =
      list.Contents?.filter((item) => item.Key) ?? [];

    if (objects.length === 0) {
      return NextResponse.json(
        { error: "写真がありません" },
        { status: 404 }
      );
    }

    const zipFiles: Record<string, Uint8Array> = {};

    for (const object of objects) {
      const key = object.Key!;

      const result = await r2.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        })
      );

      if (!result.Body) continue;

      const bytes = await result.Body.transformToByteArray();
      const originalName = getOriginalFileName(key);

      let fileName = originalName;
      let number = 2;

      while (zipFiles[fileName]) {
        const dotIndex = originalName.lastIndexOf(".");
        const name =
          dotIndex >= 0
            ? originalName.slice(0, dotIndex)
            : originalName;
        const extension =
          dotIndex >= 0
            ? originalName.slice(dotIndex)
            : "";

        fileName = `${name}_${number}${extension}`;
        number += 1;
      }

      zipFiles[fileName] = bytes;
    }

    if (Object.keys(zipFiles).length === 0) {
      return NextResponse.json(
        { error: "ZIPに追加できる写真がありません" },
        { status: 404 }
      );
    }

    const zipData = zipSync(zipFiles, {
      level: 6,
    });

    return new NextResponse(Buffer.from(zipData), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition":
          'attachment; filename="KiiGallery.zip"',
        "Content-Length": String(zipData.length),
      },
    });
  } catch (error) {
    console.error("ZIP download error:", error);

    return NextResponse.json(
      { error: "ZIP作成に失敗しました" },
      { status: 500 }
    );
  }
}