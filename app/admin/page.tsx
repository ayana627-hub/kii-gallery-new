"use client";

import { useEffect, useState } from "react";
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import GalleryForm from "./components/GalleryForm";
import GalleryCard from "./components/GalleryCard";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [galleries, setGalleries] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [galleryPassword, setGalleryPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [coverImageKey, setCoverImageKey] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoggedIn(true);
        await loadGalleries();
      } else {
        setLoggedIn(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadGalleries = async () => {
    const snapshot = await getDocs(collection(db, "galleries"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setGalleries(data);
  };

  const handleLogin = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      setLoggedIn(true);
      await loadGalleries();
    } catch (error) {
      alert("メールアドレスまたはパスワードが違います");
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

const resetForm = () => {
  setClient("");
  setLocation("");
  setTitle("");
  setCategory("");
  setGalleryPassword("");
  setExpiresAt("");
  setCoverImageKey("");
  setEditingId(null);
  setShowForm(false);
};

const handleEditGallery = (gallery: any) => {
  setEditingId(gallery.id);
  setClient(gallery.client ?? "");
  setLocation(gallery.location ?? "");
  setCategory(gallery.category ?? "");
  setTitle(gallery.title ?? "");
  setGalleryPassword(gallery.password ?? "");
  setExpiresAt(gallery.expiresAt ?? "");
  setCoverImageKey(gallery.coverImageKey ?? "");
  setShowForm(true);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const handleUpdateGallery = async () => {
  if (!editingId) return;

  if (!client || !location || !title || !galleryPassword || !expiresAt) {
    alert("タイトル・パスワード・有効期限を入力してね");
    return;
  }

  try {
    await updateDoc(doc(db, "galleries", editingId), {
  client,
  location,
  category,
  title,
  password: galleryPassword,
  expiresAt,
  coverImageKey,
  updatedAt: serverTimestamp(),
});

    resetForm();
    await loadGalleries();

    alert("変更を保存しました");
  } catch (error) {
    console.error(error);
    alert("変更の保存に失敗しました");
  }
};

const handleDeleteGallery = async (id: string) => {
  const ok = confirm("このギャラリーを削除しますか？");

  if (!ok) return;

  try {
    await deleteDoc(doc(db, "galleries", id));

    if (editingId === id) {
      resetForm();
    }

    await loadGalleries();
  } catch (error) {
    console.error(error);
    alert("削除に失敗しました");
  }
};

 const handleCreateGallery = async () => {
  if (!client || !location || !category || !title || !galleryPassword || !expiresAt) {
    alert("お客さま名・撮影場所・撮影ジャンル・タイトル・パスワード・有効期限を入力してね");
    return;
  }

  const response = await fetch("/api/drive/create-folder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      folderName: title,
    }),
  });

 const driveFolder = await response.json();

if (!response.ok) {
  alert("Google Driveフォルダ作成に失敗しました");
  console.error(driveFolder);
  return;
}

await addDoc(collection(db, "galleries"), {
  client,
  location,
  category,
  title,
  password: galleryPassword,
  expiresAt,
  coverImageKey,
  driveFolderId: driveFolder.id,
  driveFolderUrl: driveFolder.webViewLink,
  createdAt: serverTimestamp(),
});

 setClient("");
setLocation("");
setCategory("");
setTitle("");
setGalleryPassword("");
setExpiresAt("");
setShowForm(false);

  await loadGalleries();
};

  if (loading) {
    return <main style={loginPageStyle}>loading memories...</main>;
  }

  if (loggedIn) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <header style={headerStyle}>
            <h1 style={{ margin: 0 }}>Kii Gallery 管理画面</h1>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowForm(true)} style={roundButtonStyle}>
                ＋ 新しいギャラリー
              </button>

              <button onClick={handleLogout} style={logoutButtonStyle}>
                ログアウト
              </button>
            </div>
          </header>

        {showForm && (
<GalleryForm
  client={client}
  location={location}
  category={category}
  title={title}
  galleryPassword={galleryPassword}
  expiresAt={expiresAt}
coverImageKey={coverImageKey}
setCoverImageKey={setCoverImageKey}
  isEditing={editingId !== null}
  setClient={setClient}
  setLocation={setLocation}
  setCategory={setCategory}
  setTitle={setTitle}
  setGalleryPassword={setGalleryPassword}
  setExpiresAt={setExpiresAt}
  onSubmit={
    editingId !== null
      ? handleUpdateGallery
      : handleCreateGallery
  }
  onCancel={resetForm}
/>
)}

          <div style={cardStyle}>
            {galleries.length === 0 ? (
              <p style={{ margin: 0 }}>まだギャラリーはありません</p>
            ) : (
             galleries.map((gallery) => (
<GalleryCard
  key={gallery.id}
  galleryId={gallery.id}
  title={gallery.title}
  password={gallery.password}
  expiresAt={gallery.expiresAt}
  driveFolderId={gallery.driveFolderId}
  coverImageKey={gallery.coverImageKey}
  imageViews={gallery.imageViews ?? {}}
  onEdit={() => handleEditGallery(gallery)}
  onDelete={() => handleDeleteGallery(gallery.id)}
/>
))
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={loginPageStyle}>
      <div style={loginCardStyle}>
        <h1 style={loginTitleStyle}>Kiiギャラリー</h1>

        <input
          placeholder="メールアドレス"
          style={inputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="パスワード"
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin} style={primaryButtonStyle}>
          ログイン
        </button>
      </div>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f7f5ef",
  padding: "40px",
  color: "#5b4636",
};

const containerStyle = {
  maxWidth: 900,
  margin: "0 auto",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 40,
};

const cardStyle = {
  background: "#fff",
  borderRadius: 20,
  padding: 24,
  marginBottom: 30,
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
};

const galleryItemStyle = {
  borderBottom: "1px solid #eee",
  padding: "16px 0",
};

const roundButtonStyle = {
  padding: "14px 22px",
  border: "none",
  borderRadius: 999,
  background: "#d6b15d",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

const logoutButtonStyle = {
  padding: "14px 18px",
  border: "1px solid #ddd",
  borderRadius: 999,
  background: "#fff",
  color: "#5b4636",
  fontWeight: "bold",
  cursor: "pointer",
};

const loginPageStyle = {
  minHeight: "100vh",
  background: "#f7f5ef",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "#5b4636",
};

const loginCardStyle = {
  width: 380,
  background: "#fff",
  padding: 40,
  borderRadius: 24,
  boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
};

const loginTitleStyle = {
  textAlign: "center" as const,
  marginBottom: 30,
  color: "#5b4636",
};

const inputStyle = {
  width: "100%",
  padding: 14,
  marginTop: 8,
  marginBottom: 18,
  borderRadius: 12,
  border: "1px solid #ddd",
  fontSize: 15,
};

const primaryButtonStyle = {
  width: "100%",
  padding: 14,
  borderRadius: 12,
  border: "none",
  background: "#d6b15d",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  marginBottom: 12,
};

const secondaryButtonStyle = {
  width: "100%",
  padding: 14,
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  color: "#5b4636",
  fontWeight: "bold",
  cursor: "pointer",
};