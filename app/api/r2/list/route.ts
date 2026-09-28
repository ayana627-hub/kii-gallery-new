import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
const prefix = searchParams.get("prefix") ?? "";

  try {
    const result = await client.send(
      new ListObjectsV2Command({
  Bucket: process.env.R2_BUCKET_NAME!,
  Prefix: prefix,
})
    );

    const images =
  result.Contents?.map((file) => ({
    key: file.Key,
    size: file.Size,
    updated: file.LastModified,
  })) || [];

    return NextResponse.json(images);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "一覧取得失敗" },
      { status: 500 }
    );
  }
}