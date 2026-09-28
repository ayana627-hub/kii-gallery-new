type GalleryFormProps = {
  title: string;
  client: string;
  location: string;
  category: string;
  galleryPassword: string;
  expiresAt: string;
  coverImageKey: string;
  isEditing: boolean;

  setTitle: (value: string) => void;
  setClient: (value: string) => void;
  setLocation: (value: string) => void;
  setCategory: (value: string) => void;
  setGalleryPassword: (value: string) => void;
  setExpiresAt: (value: string) => void;
  setCoverImageKey: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export default function GalleryForm({
  title,
  client,
  location,
  category,
  galleryPassword,
  expiresAt,
  coverImageKey,
  setCoverImageKey,
  isEditing,
  setTitle,
  setClient,
  setLocation,
  setCategory,
  setGalleryPassword,
  setExpiresAt,
  onSubmit,
  onCancel,
}: GalleryFormProps) {
  return (
    <div style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>
        {isEditing ? "ギャラリーを編集" : "新しいギャラリー"}
      </h2>

      <input
        placeholder="お客さま名（例：山田）"
        value={client}
        onChange={(e) => setClient(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="撮影場所（例：海の中道海浜公園）"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        style={inputStyle}
      />
<select
  value={category}
  onChange={(e) => {
  const newCategory = e.target.value;
  setCategory(newCategory);

  const titles: Record<string, string> = {
    七五三: "七五三",
    お宮参り: "お宮参り",
    ハーフバースデー: "Half Birthday",
    バースデー: "Birthday",
    家族写真: "Family Photo",
    季節の花: "Seasonal Flowers",
    ニューボーン: "Newborn",
    成人式: "成人式",
  };

  setTitle(titles[newCategory] ?? "");
}}
  style={inputStyle}
>
<option value="">撮影ジャンルを選択</option>
<option value="七五三">七五三</option>
<option value="お宮参り">お宮参り</option>
<option value="ハーフバースデー">ハーフバースデー</option>
<option value="バースデー">バースデー</option>
<option value="家族写真">家族写真</option>
<option value="季節の花">季節の花</option>
<option value="ニューボーン">ニューボーン</option>
<option value="成人式">成人式</option>
<option value="その他">その他</option>
</select>


      <input
        placeholder="タイトル（例：Half Birthday）"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="閲覧パスワード"
        value={galleryPassword}
        onChange={(e) => setGalleryPassword(e.target.value)}
        style={inputStyle}
      />

      <input
        type="date"
        value={expiresAt}
        onChange={(e) => setExpiresAt(e.target.value)}
        style={inputStyle}
      />

      <button onClick={onSubmit} style={primaryButtonStyle}>
        {isEditing ? "変更を保存" : "ギャラリーを作成"}
      </button>

      <button onClick={onCancel} style={secondaryButtonStyle}>
        キャンセル
      </button>
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  borderRadius: 20,
  padding: 24,
  marginBottom: 30,
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
};

const inputStyle = {
  width: "100%",
  padding: 14,
  marginTop: 8,
  marginBottom: 18,
  borderRadius: 12,
  border: "1px solid #ddd",
  fontSize: 15,
  boxSizing: "border-box" as const,
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