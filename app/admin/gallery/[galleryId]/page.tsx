"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type GalleryImage = {
  key: string;
  size: number;
  updated: string;
};

export default function PhotoReactionPage() {
  const params = useParams();
  const galleryId = params.galleryId as string;

  const [title, setTitle] = useState("");
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [imageViews, setImageViews] = useState<Record<string, number>>({});
  const [favoriteImageKeys, setFavoriteImageKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!galleryId) return;

      const galleryRef = doc(db, "galleries", galleryId);
      const gallerySnap = await getDoc(galleryRef);

      if (!gallerySnap.exists()) {
        setLoading(false);
        return;
      }

      const data = gallerySnap.data();
      const folderId = data.driveFolderId ?? "";

      setTitle(data.title ?? "");
      setImageViews(data.imageViews ?? {});
      setFavoriteImageKeys(data.favoriteImageKeys ?? []);

      if (folderId) {
        const response = await fetch(
          `/api/r2/list?prefix=${encodeURIComponent(`${folderId}/`)}`
        );

        const imageData = await response.json();
        setImages(imageData);
      }

      setLoading(false);
    }

    loadData();
  }, [galleryId]);

  const getViewCount = (imageKey: string) => {
    const safeKey = imageKey.replace(/[~*\/\[\]\.]/g, "_");
    return imageViews[safeKey] ?? 0;
  };

const setCoverImage = async (imageKey: string) => {
  if (!galleryId) return;

  try {
    await updateDoc(doc(db, "galleries", galleryId), {
      coverImageKey: imageKey,
    });

    alert("この写真を表紙に設定しました📷");
  } catch (error) {
    console.error(error);
    alert("表紙の設定に失敗しました");
  }
};

  const sortedImages = [...images].sort(
    (a, b) => getViewCount(b.key) - getViewCount(a.key)
  );

  if (loading) {
    return (
      <main style={{ padding: 40, color: "#5D4B3E" }}>
        読み込み中...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#FCFAF5",
        padding: "40px 24px",
        color: "#5D4B3E",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <a
          href="/admin"
          style={{
            color: "#5D4B3E",
            textDecoration: "none",
          }}
        >
          ← 管理画面に戻る
        </a>

        <h1 style={{ marginTop: 28, marginBottom: 6 }}>
          📊 写真の反応
        </h1>

        <p style={{ marginTop: 0, marginBottom: 28, opacity: 0.7 }}>
          {title}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 18,
          }}
        >
          {sortedImages.map((image) => (
            <div key={image.key}>
              <img
                src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${image.key}`}
                alt=""
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  objectFit: "cover",
                  borderRadius: 16,
                  display: "block",
                }}
              />

              <div
                style={{
                  marginTop: 8,
                  textAlign: "center",
                  fontSize: 14,
                }}
              >
                📷 {getViewCount(image.key)}　{favoriteImageKeys.includes(image.key) ? "❤️" : "♡"}
              </div>
              <button
  type="button"
  onClick={() => setCoverImage(image.key)}
  style={{
    width: "100%",
    marginTop: 8,
    padding: "8px 10px",
    border: "1px solid #E8D47A",
    borderRadius: 12,
    background: "#fff",
    color: "#5D4B3E",
    cursor: "pointer",
    fontSize: 13,
  }}
>
  📷 表紙にする
</button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}