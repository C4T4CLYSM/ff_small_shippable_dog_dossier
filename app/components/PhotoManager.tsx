"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { photoUrl, MAX_PHOTOS } from "@/lib/dogPhotos";
import type { DogPhoto } from "@/types/database";

const MAX_BYTES = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// Photos save as soon as they are added, removed or moved, separately from the rest of the form.
export default function PhotoManager({ dogId }: { dogId: string }) {
  const [photos, setPhotos] = useState<DogPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("dog_photos").select("*").eq("dog_id", dogId).order("position")
      .then(({ data }) => { setPhotos(data ?? []); setLoading(false); });
  }, [dogId]);

  // dogs.photo_url mirrors the main photo, for the dashboard list
  async function syncMainPhoto(list: DogPhoto[]) {
    await supabase.from("dogs")
      .update({ photo_url: list[0] ? photoUrl(list[0].path) : null })
      .eq("id", dogId);
  }

  async function addPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setError(null);

    const room = MAX_PHOTOS - photos.length;
    if (files.length > room) {
      setError(`You can add ${room} more photo${room === 1 ? "" : "s"} (${MAX_PHOTOS} at most).`);
      return;
    }
    const bad = files.find(f => !EXTENSIONS[f.type] || f.size > MAX_BYTES);
    if (bad) {
      setError(`"${bad.name}" can't be added. Use a JPG, PNG or WebP file under 5 MB.`);
      return;
    }

    setBusy(true);
    const list = [...photos];
    for (const file of files) {
      const path = `${dogId}/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
      const { error: uploadError } = await supabase.storage.from("dog-photos").upload(path, file);
      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        break;
      }
      const { data, error: insertError } = await supabase.from("dog_photos")
        .insert({ dog_id: dogId, path, position: list.length })
        .select()
        .single();
      if (insertError || !data) {
        await supabase.storage.from("dog-photos").remove([path]);
        setError(`Couldn't save the photo: ${insertError?.message ?? "unknown error"}`);
        break;
      }
      list.push(data);
      setPhotos([...list]);
    }
    await syncMainPhoto(list);
    setBusy(false);
  }

  async function removePhoto(photo: DogPhoto) {
    setBusy(true);
    setError(null);
    const { error: deleteError } = await supabase.from("dog_photos").delete().eq("id", photo.id);
    if (deleteError) {
      setError(`Couldn't remove the photo: ${deleteError.message}`);
      setBusy(false);
      return;
    }
    await supabase.storage.from("dog-photos").remove([photo.path]);

    const list = photos.filter(p => p.id !== photo.id).map((p, i) => ({ ...p, position: i }));
    await Promise.all(list.map(p => supabase.from("dog_photos").update({ position: p.position }).eq("id", p.id)));
    setPhotos(list);
    await syncMainPhoto(list);
    setBusy(false);
  }

  async function movePhoto(from: number, to: number) {
    if (to < 0 || to >= photos.length) return;
    setBusy(true);
    setError(null);
    const list = [...photos];
    [list[from], list[to]] = [list[to], list[from]];
    const reordered = list.map((p, i) => ({ ...p, position: i }));
    await Promise.all([
      supabase.from("dog_photos").update({ position: to }).eq("id", photos[from].id),
      supabase.from("dog_photos").update({ position: from }).eq("id", photos[to].id),
    ]);
    setPhotos(reordered);
    if (from === 0 || to === 0) await syncMainPhoto(reordered);
    setBusy(false);
  }

  if (loading) return <p className="text-[0.9rem] text-cream/50">Loading photos...</p>;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, i) => (
          <div key={photo.id} className="overflow-hidden rounded-xl bg-slate/40 ring-1 ring-cream/10">
            <div className="relative aspect-[4/3] bg-navy">
              <Image src={photoUrl(photo.path)} alt={`Photo ${i + 1}`} fill sizes="200px" className="object-contain" />
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-orange px-2 py-0.5 font-heading text-[0.65rem] font-bold uppercase tracking-wide text-cream">
                  Main photo
                </span>
              )}
            </div>
            <div className="flex items-center justify-between px-2 py-1.5">
              <div className="flex gap-1">
                <IconButton label={`Move photo ${i + 1} earlier`} disabled={busy || i === 0} onClick={() => movePhoto(i, i - 1)}>←</IconButton>
                <IconButton label={`Move photo ${i + 1} later`} disabled={busy || i === photos.length - 1} onClick={() => movePhoto(i, i + 1)}>→</IconButton>
              </div>
              <IconButton label={`Remove photo ${i + 1}`} disabled={busy} onClick={() => removePhoto(photo)} danger>✕</IconButton>
            </div>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <label className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-cream/20 text-center transition hover:border-orange ${busy ? "pointer-events-none opacity-50" : ""}`}>
            <span className="font-heading text-[1.6rem] leading-none text-orange">+</span>
            <span className="font-heading text-[0.85rem] font-bold text-cream/80">{busy ? "Uploading..." : "Add photos"}</span>
            <span className="text-[0.72rem] text-cream/40">JPG, PNG or WebP, up to 5 MB</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} disabled={busy} className="hidden" />
          </label>
        )}
      </div>

      <p className="text-[0.8rem] text-cream/40">
        {photos.length} of {MAX_PHOTOS} photos. The first photo is the main photo. Photos save as soon as you add, move or remove them.
      </p>
      {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-[0.85rem] text-red-400">{error}</p>}
    </div>
  );
}

function IconButton({ label, onClick, disabled, danger, children }: {
  label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode;
}) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled}
      className={`grid h-8 w-8 place-items-center rounded-lg font-heading text-[0.9rem] text-cream/70 transition disabled:opacity-30 ${
        danger ? "hover:bg-red-500/20 hover:text-red-400" : "hover:bg-cream/10 hover:text-cream"
      }`}>
      {children}
    </button>
  );
}
