"use client";

import { useEffect, useRef, useState } from "react";

type GalleryCardProps = {
  galleryId: string;
  title: string;
  password: string;
  expiresAt: string;
  driveFolderId: string;
  coverImageKey?: string;
  imageViews?: Record<string, number>;
  onEdit: () => void;
  onDelete: () => void;
};

export default function GalleryCard({
  galleryId,
  title,
  password,
  expiresAt,
  driveFolderId,
  coverImageKey,
  imageViews,
  onEdit,
  onDelete,
}: GalleryCardProps) {

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [images, setImages] = useState<
    { key: string; size: number; updated: string }[]
  >([]);
  const coverImageUrl = coverImageKey
    ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${coverImageKey}`
    : "";

  const loadImages = async () => {
    if (!driveFolderId) return;

    const res = await fetch(
      `/api/r2/list?prefix=${encodeURIComponent(`${driveFolderId}/`)}`
    );

    const data = await res.json();
    setImages(data);
  };

  useEffect(() => {
    loadImages();
  }, [driveFolderId]);

  const handleSelectPhotos = () => {
    if (!driveFolderId) {
      alert("Google Driveの保存先フォルダが見つかりません");
      return;
    }

    fileInputRef.current?.click();
  };

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;

    if (!files || files.length === 0 || !driveFolderId) {
      return;
    }

    setUploading(true);
    setUploadMessage(`0 / ${files.length}枚`);

    try {
      for (let index = 0; index < files.length; index++) {
        const formData = new FormData();

        formData.append("file", files[index]);
        formData.append("folderId", driveFolderId);

        const response = await fetch("/api/drive/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          console.error(result);
          throw new Error(
            result.error || `${files[index].name}のアップロードに失敗しました`
          );
        }

        setUploadMessage(`${index + 1} / ${files.length}枚`);
      }

      alert(`${files.length}枚の写真をアップロードしました！`);
      setUploadMessage("アップロード完了");
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "写真のアップロードに失敗しました"
      );
      setUploadMessage("アップロード失敗");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div style={cardStyle}>
      {coverImageUrl && (
  <img
    src={coverImageUrl}
    alt={title}
    style={{
      width: "100%",
      aspectRatio: "16 / 9",
      objectFit: "cover",
      borderRadius: 16,
      marginBottom: 12,
      display: "block",
    }}
  />
)}
      <h3 style={{ margin: "0 0 12px" }}>{title}</h3>

      <p style={{ margin: "0 0 8px" }}>🔑 {password}</p>
      <p style={{ margin: "0 0 16px" }}>📅 {expiresAt}</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        style={{ display: "none" }}
      />

      <button
        type="button"
        onClick={onEdit}
        style={editButton}
      >
        ✏️ 編集
      </button>
      <a
        href={`/gallery/${galleryId}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          padding: "11px 18px",
          borderRadius: 14,
          border: "1px solid #E7D57A",
          background: "#FFFDF5",
          color: "#7A6130",
          fontWeight: "bold",
          textDecoration: "none",
          marginLeft: 8,
        }}
      >
        👀 お客さまページを見る
      </a>
      <button
        type="button"
        onClick={handleSelectPhotos}
        disabled={uploading}
        style={{
          ...uploadButton,
          opacity: uploading ? 0.6 : 1,
          cursor: uploading ? "not-allowed" : "pointer",
        }}
      >
        {uploading ? "アップロード中…" : "📷 写真を追加"}
      </button>

      <a
        href={`/admin/gallery/${galleryId}`}
        style={{
          display: "inline-block",
          marginBottom: 18,
          padding: "11px 18px",
          borderRadius: 14,
          border: "1px solid rgba(232,212,122,0.8)",
          background: "rgba(255,255,255,0.7)",
          color: "#5D4B3E",
          fontWeight: "bold",
          textDecoration: "none",
        }}
      >
        📊 写真の反応を見る
      </a>

      <button
        type="button"
        onClick={onDelete}
        style={deleteButton}
      >
        🗑 削除
      </button>

      {uploadMessage && (
        <p style={{ margin: "14px 0 0", fontSize: 14 }}>
          {uploadMessage}
        </p>
      )}
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 20,
  marginBottom: 20,
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
};

const editButton = {
  padding: "11px 18px",
  borderRadius: 14,
  border: "none",
  background: "#F4D77A",
  color: "#6A4E2F",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 4px 10px rgba(214, 177, 93, 0.18)",
};

const uploadButton = {
  padding: "11px 18px",
  borderRadius: 14,
  border: "1px solid #E7D57A",
  background: "#FFF8E5",
  color: "#7A6130",
  fontWeight: "bold",
};

const deleteButton = {
  padding: "11px 18px",
  borderRadius: 14,
  border: "1px solid #E5DED5",
  background: "#FFFFFF",
  color: "#9A8878",
  fontWeight: "bold",
  cursor: "pointer",
};