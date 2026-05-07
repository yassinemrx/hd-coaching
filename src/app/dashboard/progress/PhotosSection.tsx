"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useDict } from "@/components/I18nProvider";

type Photo = {
  id: string;
  weekLabel: string;
  photoUrl: string;
  createdAt: string;
};

export default function PhotosSection({ photos }: { photos: Photo[] }) {
  const t = useDict();
  const router = useRouter();
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const fd = new FormData();
      fd.append("file", files[i]);
      const res = await fetch("/api/photos", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || t.progress.uploadFailed);
        setUploading(false);
        return;
      }
    }

    setUploading(false);
    setFiles(null);
    (document.getElementById("photo-input") as HTMLInputElement).value = "";
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm(t.progress.deletePhotoConfirm)) return;
    const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  const groups = photos.reduce<Record<string, Photo[]>>((acc, p) => {
    (acc[p.weekLabel] ||= []).push(p);
    return acc;
  }, {});
  const weeks = Object.keys(groups).sort((a, b) => (a < b ? 1 : -1));

  return (
    <section className="card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t.progress.photosTitle}</h2>
        <span className="text-xs text-slate-400">{t.progress.photosLimit}</span>
      </div>

      <form onSubmit={onSubmit} className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[260px]">
          <label className="label" htmlFor="photo-input">
            {t.progress.addPhotos}
          </label>
          <input
            id="photo-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-700"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={!files || uploading}>
          {uploading ? t.progress.uploading : t.progress.upload}
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </form>

      {weeks.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">{t.progress.noPhotos}</p>
      ) : (
        <div className="mt-6 space-y-6">
          {weeks.map((week) => (
            <div key={week}>
              <h3 className="mb-2 text-sm font-medium text-slate-700">
                {week}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {groups[week].map((p) => (
                  <figure
                    key={p.id}
                    className="group relative overflow-hidden rounded-lg ring-1 ring-slate-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.photoUrl}
                      alt={`Progress photo ${p.weekLabel}`}
                      className="aspect-square w-full object-cover"
                    />
                    <figcaption className="flex items-center justify-between bg-white px-2 py-1 text-xs text-slate-500">
                      <span>{format(new Date(p.createdAt), "MMM d")}</span>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        {t.common.delete}
                      </button>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
