"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

type DriveImage = {
  key: string;
  size: number;
  updated: string;
};

export default function GalleryPage() {
  const [images, setImages] = useState<DriveImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<DriveImage | null>(null);
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [folderId, setFolderId] = useState("");
  const [coverImageKey, setCoverImageKey] = useState("");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [showGallery, setShowGallery] = useState(false);

  const [savedPassword, setSavedPassword] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  async function toggleFavorite(imageKey: string) {
  const newFavorites = favorites.includes(imageKey)
    ? favorites.filter((key) => key !== imageKey)
    : [...favorites, imageKey];

  setFavorites(newFavorites);

  localStorage.setItem(
    `favorites-${galleryId}`,
    JSON.stringify(newFavorites)
  );

  const galleryRef = doc(db, "galleries", galleryId);

  await updateDoc(galleryRef, {
    favoriteImageKeys: newFavorites,
  });
}

  const params = useParams();
  const galleryId = params.galleryId as string;

  const UNLOCK_DURATION = 30 * 60 * 1000;

  useEffect(() => {
    const savedFavorites = localStorage.getItem(`favorites-${galleryId}`);

    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, [galleryId]);

  useEffect(() => {
    const unlockedAt = localStorage.getItem(`unlocked-${galleryId}`);

    if (unlockedAt) {
      const elapsed = Date.now() - Number(unlockedAt);

      if (elapsed < UNLOCK_DURATION) {
        setIsUnlocked(true);
      }
    }
  }, [galleryId]);

  async function loadGallery() {
    if (!galleryId) return;

    const galleryRef = doc(db, "galleries", galleryId);
    const gallerySnap = await getDoc(galleryRef);

    if (!gallerySnap.exists()) {
      alert("ギャラリーが見つかりません");
      return;
    }

    const galleryData = gallerySnap.data();

    const currentFolderId = galleryData.driveFolderId ?? "";

    setTitle(galleryData.title ?? "");
    setClient(galleryData.client ?? "");
    setLocation(galleryData.location ?? "");
    setCategory(galleryData.category ?? "");
    setExpiresAt(galleryData.expiresAt ?? "");
    setSavedPassword(galleryData.password ?? "");
    setCoverImageKey(galleryData.coverImageKey ?? "");
    setFolderId(currentFolderId);

    await loadImages(currentFolderId);
  }

  useEffect(() => {
    loadGallery();
  }, [galleryId]);

  const handleUnlock = () => {
    if (inputPassword === savedPassword) {
      setIsUnlocked(true);
      localStorage.setItem(`unlocked-${galleryId}`, Date.now().toString());
    } else {
      alert("パスワードが違います");
    }
  };

  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const currentIndex = images.findIndex(
        (image) => image.key === selectedImage.key
      );

      if (event.key === "Escape") {
        setSelectedImage(null);
      }

      if (event.key === "ArrowLeft" && images.length > 0) {
        const prevIndex =
          currentIndex === 0 ? images.length - 1 : currentIndex - 1;

        setSelectedImage(images[prevIndex]);
      }

      if (event.key === "ArrowRight" && images.length > 0) {
        const nextIndex =
          currentIndex === images.length - 1 ? 0 : currentIndex + 1;

        setSelectedImage(images[nextIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage, images]);

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStart(e.touches[0].clientX);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStart === null || !selectedImage || images.length === 0) return;

    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;

    const currentIndex = images.findIndex(
      (image) => image.key === selectedImage.key
    );

    if (distance > 50) {
      const nextIndex =
        currentIndex === images.length - 1 ? 0 : currentIndex + 1;
      setSelectedImage(images[nextIndex]);
    }

    if (distance < -50) {
      const prevIndex =
        currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      setSelectedImage(images[prevIndex]);
    }

    setTouchStart(null);
  }

async function loadImages(currentFolderId: string) {
  if (!currentFolderId) return;

  const response = await fetch(
    `/api/r2/list?prefix=${encodeURIComponent(`${currentFolderId}/`)}`
  );

  const data = await response.json();

  setImages(data);
}

  if (!isUnlocked) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f7f5ef",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 380,
            background: "#fff",
            padding: 32,
            borderRadius: 24,
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ color: "#5b4636" }}>Kii Gallery</h2>

          <p style={{ color: "#7a6a5d" }}>
            パスワードを入力してください
          </p>

          <input
            type={showPassword ? "text" : "password"}
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: "1px solid #ddd",
              marginTop: 12,
              marginBottom: 16,
              boxSizing: "border-box",
            }}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈 隠す" : "👁 表示"}
          </button>

          <button
            type="button"
            onClick={handleUnlock}
            style={{
              width: "100%",
              padding: 14,
              border: "none",
              borderRadius: 12,
              background: "#d6b15d",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            写真を見る
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-[#FCFAF5] text-[#5D4B3E]"
      style={{
        backgroundColor: showGallery ? "#FCFAF5" : "transparent",
        backgroundImage:
          !showGallery && images.length > 0
            ? `url(${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${coverImageKey || images[0].key})`
            : "none",
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >

      {!showGallery && (
        <div
          style={{
            minHeight: "100vh",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 背景写真 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                images.length > 0
                  ? `url(${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${coverImageKey || images[0].key})`
                  : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* 全体に薄い白ベール */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(252, 250, 245, 0.18)",
            }}
          />

          {/* 中身 */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              minHeight: "100vh",
              padding: "28px 32px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* 上段 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 24,
              }}
            >
              {/* Kiiロゴ */}
              <img
                src="/logo.png"
                alt="Kii logo"
                style={{
                  width: 190,
                  height: "auto",
                  display: "block",
                }}
              />

              {/* カテゴリ */}
              <div
                style={{
                  textAlign: "right",
                  color: "#5D4B3E",
                  marginRight: 28,
                  marginTop: 24,
                }}
              >
                <div
                  style={{
                    fontSize: 40,
                    fontFamily: '"Marcellus", serif',
                    fontWeight: 400,
                    letterSpacing: "0.08em",
                  }}
                >
                  {category}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 18,
                    fontFamily: '"Marcellus", serif',
                    letterSpacing: "0.18em",
                    lineHeight: 1.9,
                    opacity: 0.72,
                  }}
                >
                  capturing little moments,
                  <br />
                  keeping them forever.
                </div>
              </div>
            </div>

            {/* 下側を押し下げる */}
            <div style={{ flex: 1 }} />

            {/* 下部：お客さま情報 ＋ 4ボタン */}
            <div
              style={{
                width: "calc(100% - 80px)",
                maxWidth: 1100,
                margin: "0 auto",
                gap: 10,
                padding: "12px 16px",
                borderRadius: 24,
                background: "rgba(255,255,255,0.46)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.55)",
                boxShadow: "0 10px 30px rgba(93,75,62,0.08)",
              }}
            >

              {/* お客さま情報：PCは横並び */}
              <div
                className="flex flex-col md:flex-row md:items-center"
                style={{
                  color: "#5D4B3E",
                  gap: 18,
                  width: "100%",
                  alignItems: "center",
                  paddingLeft: 16,
                }}
              >
                {/* お客さま名 */}
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {client}さま
                </div>

                {/* 場所 */}
                <div
                  style={{
                    fontSize: 18,
                    whiteSpace: "nowrap",
                  }}
                >
                  📍 {location}
                </div>

                {/* 枚数 */}
                <div
                  style={{
                    fontSize: 18,
                    whiteSpace: "nowrap",
                  }}
                >
                  📷 {images.length}枚
                </div>

                {/* 期限 */}
                <div
                  style={{
                    fontSize: 18,
                    whiteSpace: "nowrap",
                  }}
                >
                  📅 {expiresAt}まで
                </div>
              </div>

              {/* 4ボタン */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 12,
                  width: "100%",
                  margin: 0,
                }}
              >
                {/* 思い出を開く */}
                <button
                  type="button"
                  onClick={() => setShowGallery(true)}
                  style={{
                    padding: "17px 22px",
                    borderRadius: 24,
                    border: "1px solid rgba(255,255,255,0.65)",
                    background: "rgba(240, 218, 92, 0.72)",
                    color: "#5D4B3E",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    boxShadow:
                      "inset 0 1px 1px rgba(255,255,255,0.75), 0 7px 18px rgba(93,75,62,0.14)",
                    cursor: "pointer",
                    fontSize: 16,
                  }}

                >
                  思い出を開く
                </button>

                {/* お気に入り */}
                <button
                  type="button"
                  onClick={() => {
                    setShowFavoritesOnly(true);
                    setShowGallery(true);
                  }}
                  style={{
                    padding: "17px 22px",
                    borderRadius: 24,
                    border: "1px solid rgba(255,255,255,0.75)",
                    background: "rgba(255,255,255,0.62)",
                    color: "#5D4B3E",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    boxShadow:
                      "inset 0 1px 1px rgba(255,255,255,0.9), 0 7px 18px rgba(93,75,62,0.12)",
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                >
                  お気に入り
                </button>

                {/* まとめて保存 */}
                <a
                  href={`/api/r2/download-zip?galleryId=${folderId}`}
                  style={{
                    padding: "17px 22px",
                    borderRadius: 24,
                    border: "1px solid rgba(255,255,255,0.65)",
                    background: "rgba(240, 218, 92, 0.72)",
                    color: "#5D4B3E",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    boxShadow:
                      "inset 0 1px 1px rgba(255,255,255,0.75), 0 7px 18px rgba(93,75,62,0.14)",
                    cursor: "pointer",
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  まとめて保存
                </a>

                {/* 家族にシェア */}
                <button
  type="button"
  onClick={async () => {
    const shareData = {
      title: "Kii Gallery",
      text: `${client}さまのお写真が届きました📷`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // シェアを閉じた時は何もしない
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("ギャラリーのURLをコピーしました");
    }
  }}
  style={{
                    padding: "17px 22px",
                    borderRadius: 24,
                    border: "1px solid rgba(255,255,255,0.75)",
                    background: "rgba(255,255,255,0.62)",
                    color: "#5D4B3E",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    boxShadow:
                      "inset 0 1px 1px rgba(255,255,255,0.9), 0 7px 18px rgba(93,75,62,0.12)",
                    cursor: "pointer",
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  家族にシェア
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showGallery && (
        <>
          <img
            src="/logo.png"
            alt="Kii logo"
            style={{
              width: 150,
              height: "auto",
              display: "block",
              marginBottom: -6,
            }}
          />

          <button
            type="button"
            onClick={() => setShowGallery(false)}
            style={{
              border: "none",
              background: "transparent",
              color: "#5D4B3E",
              fontSize: 15,
              cursor: "pointer",
              marginBottom: 20,
              marginLeft: 12,
              display: "block",
              marginRight: "auto",
            }}
          >

            ← トップに戻る
          </button>

          <a
            href={`/api/r2/download-zip?galleryId=${folderId}`}
            style={{
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "17px 22px",
  borderRadius: 24,
  border: "1px solid rgba(255,255,255,0.65)",
  background: "rgba(240, 218, 92, 0.72)",
  color: "#5D4B3E",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "0 8px 24px rgba(93,75,62,0.10)",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: 16,
}}
          >
            📦 写真をまとめてダウンロード
          </a>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 280px))",
              gap: 12,
              width: "100%",
              maxWidth: 1200,
              margin: "0 auto",
              padding: 24,
            }}
          >

            {(showFavoritesOnly
              ? images.filter((image) => favorites.includes(image.key))
              : images
            ).map((image) => (
              <div
                key={image.key}
                onClick={async () => {
  setSelectedImage(image);

  await updateDoc(doc(db, "galleries", galleryId), {
    [`imageViews.${image.key.replace(/[~*\/\[\]\.]/g, "_")}`]: increment(1),
  });
}}
                style={{
                  position: "relative",
                  background: "#fff",
                  borderRadius: 22,
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  cursor: "pointer",
                }}
              >

                <img
                  src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${image.key}`}
                  alt={image.key}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(image.key);
                  }}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    border: "none",
                    background: "rgba(255,255,255,0.85)",
                    borderRadius: "50%",
                    width: 34,
                    height: 34,
                    fontSize: 22,
                    cursor: "pointer",
                  }}
                >
                  {favorites.includes(image.key) ? "❤️" : "♡"}
                </button>

              </div>
            ))}
          </div>
        </>
      )}

      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
            cursor: "zoom-out",
          }}
        >
          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: "absolute",
              top: 20,
              right: 24,
              background: "rgba(255,255,255,0.9)",
              border: "none",
              borderRadius: "50%",
              width: 44,
              height: 44,
              fontSize: 26,
              cursor: "pointer",
              zIndex: 10000,
            }}
          >
            ×
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = images.findIndex(
                (image) => image.key === selectedImage.key
              );
              const prevIndex =
                currentIndex === 0 ? images.length - 1 : currentIndex - 1;
              setSelectedImage(images[prevIndex]);
            }}
            style={{
              position: "absolute",
              left: 20,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.9)",
              color: "#333",
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "none",
              fontSize: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              lineHeight: 1,
              cursor: "pointer",

            }}
          >
            <span style={{ transform: "translateY(-2px)" }}>
              ‹
            </span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = images.findIndex(
                (image) => image.key === selectedImage.key
              );
              const nextIndex =
                currentIndex === images.length - 1 ? 0 : currentIndex + 1;
              setSelectedImage(images[nextIndex]);
            }}
            style={{
              position: "absolute",
              right: 20,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.9)",
              color: "#333",
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "none",
              fontSize: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              lineHeight: 1,
              cursor: "pointer",
              zIndex: 10000,
            }}
          >
            <span style={{ transform: "translateY(-2px)" }}>›</span>
          </button>

          <img
            src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${selectedImage.key}`}
            alt={selectedImage.key}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "95vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: 14,
            }}
          />
<a
  href={`/api/r2/download?key=${encodeURIComponent(selectedImage.key)}`}
  onClick={(e) => e.stopPropagation()}
  style={{
    position: "absolute",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    padding: "10px 18px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.92)",
    color: "#5D4B3E",
    textDecoration: "none",
    fontSize: 14,
    cursor: "pointer",
    zIndex: 10001,
    whiteSpace: "nowrap",
  }}
>
  📷 この写真を保存
</a>
        </div>
      )}

    </main>
  );
}