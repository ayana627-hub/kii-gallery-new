"use client";
import { gallery } from "@/lib/gallery";
export default function Home() {

  const shareLink = async () => {
  const shareData = {
    title: "Kii Gallery",
    text: "写真ギャラリーを共有します♡",
    url: window.location.href,
  };

  if (navigator.share) {
    await navigator.share(shareData);
  } else {
    await navigator.clipboard.writeText(window.location.href);
    alert("リンクをコピーしました♡");
  }
};

  return (
    <main
      className="min-h-screen bg-[#FCFAF5] text-[#5D4B3E]"
      style={{
        backgroundImage: `url(${gallery.heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      <div className="min-h-screen bg-[#FCFAF5]/40 backdrop-blur-[1px] px-6 py-10 flex flex-col justify-end">

        <div className="absolute top-8 left-4 text-left">
          <img
  src="/logo.png"
  alt="Kii logo"
  className="h-40 md:h-56 w-auto"
/>
        </div>

        <div className="mb-8 text-right">
          <h1 className="text-3xl md:text-5xl tracking-wide font-light">
            {gallery.title}
          </h1>
          <p className="mt-3 text-sm tracking-[0.25em] leading-relaxed">
            {gallery.subtitle}
          </p>
        </div>

        <section className="rounded-[28px] bg-[#FCFAF5]/70 backdrop-blur-md border border-white/10 py-5 px-8 mb-6">
          <div className="space-y-5 text-lg">
            <div className="flex items-center gap-4 border-b border-[#5D4B3E]/15 pb-4">
              <span className="text-2xl">💛</span>
              <span>{gallery.client}さま</span>
            </div>

            <div className="flex items-center gap-4 border-b border-[#5D4B3E]/15 pb-4">
              <span className="text-2xl">📍</span>
              <span>{gallery.location}</span>
            </div>

<div className="flex items-center gap-4 pb-4">
  <span className="text-2xl">📷</span>
  <span>
    {gallery.images.length}枚　　🗓️ 2026-08-05まで
  </span>

</div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <a
          href="/gallery"
          className="bg-[#EBD47A]/70 text-[#5D4B3E] backdrop-blur-md rounded-2xl py-4 shadow-lg border border-white/30 hover:scale-[1.02] hover:brightness-105 active:scale-[0.98] transition-all duration-300 border border-white/50 text-base text-center"
          >
            思い出を開く
            </a>

          <a
  href="/halfbirthday.zip"
  download
  className="bg-[#EBD47A]/70 text-[#5D4B3E] backdrop-blur-md rounded-2xl py-4 shadow-lg text-center border border-white/30 hover:scale-[1.02] hover:brightness-105 active:scale-[0.98] transition-all duration-300"
>
  まとめて保存
</a>

          <button
  onClick={shareLink}
  className="bg-[#FCFAF5]/60 backdrop-blur-md rounded-2xl py-4 shadow-md border border-white/30 text-center hover:scale-[1.02] hover:brightness-105 active:scale-[0.98] transition-all duration-300"
>
  家族にシェア
</button>


          <a
  href="/gallery?favorites=true"
  className="bg-[#FCFAF5]/60 backdrop-blur-md rounded-2xl py-4 shadow-md border border-white/30 text-center hover:scale-[1.02] hover:brightness-105 active:scale-[0.98] transition-all duration-300"
>
  お気に入り
</a>
        </div>

      </div>
    </main>
  );
}