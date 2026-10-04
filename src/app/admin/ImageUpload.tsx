"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

const BUCKET = "media";
/** Longest side, in pixels, an uploaded image is scaled down to. */
const MAX_SIDE = 1600;
/** Longest side of the small companion used on cards - see lib/thumb.ts. */
const THUMB_SIDE = 720;
const QUALITY = 0.8;

/**
 * Scales an image so its longest side is at most `maxSide` and re-encodes it
 * as WebP (much smaller than JPEG or PNG, and it keeps transparency). Returns
 * null if the browser can't decode or encode it, so callers can fall back.
 */
async function resize(file: File, maxSide: number, quality: number): Promise<Blob | null> {
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) return null;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return null;

  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return null;
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  // Older Safari can't encode WebP and silently returns PNG - not worth using.
  return blob && blob.type === "image/webp" ? blob : null;
}

/**
 * The full-size image: at most MAX_SIDE, as WebP - unless that doesn't make it
 * any smaller, in which case the original is kept. SVGs and GIFs are untouched.
 */
async function prepareMain(file: File): Promise<Blob> {
  const blob = await resize(file, MAX_SIDE, QUALITY);
  if (!blob) return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  const alreadySmall = bitmap ? Math.max(bitmap.width, bitmap.height) <= MAX_SIDE : false;
  bitmap?.close();
  return alreadySmall && blob.size >= file.size ? file : blob;
}

export function ImageUpload({
  name,
  label,
  defaultValue = "",
  required = false,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    if (!picked) return;

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("Image storage is not configured yet.");
      return;
    }

    setBusy(true);
    setError(null);

    const [main, thumb] = await Promise.all([
      prepareMain(picked),
      // A card-sized copy. If the browser can't make one (an SVG or GIF, say),
      // the original doubles as the thumbnail so the card still has an image.
      resize(picked, THUMB_SIDE, 0.78).then((blob) => blob ?? picked),
    ]);
    if (main.size > 5 * 1024 * 1024) {
      setBusy(false);
      setError("That image is over 5 MB. Please use a smaller one.");
      return;
    }

    const ext = main.type === "image/webp" ? "webp" : picked.name.split(".").pop()?.toLowerCase() || "jpg";
    const base = `${name}/${crypto.randomUUID()}`;
    const path = `${base}.${ext}`;
    const options = { cacheControl: "31536000", upsert: false };

    // Same name with ".thumb.webp" - lib/thumb.ts derives the card image this way.
    const [mainUpload, thumbUpload] = await Promise.all([
      supabase.storage.from(BUCKET).upload(path, main, { ...options, contentType: main.type }),
      supabase.storage.from(BUCKET).upload(`${base}.thumb.webp`, thumb, { ...options, contentType: thumb.type }),
    ]);

    setBusy(false);

    const uploadError = mainUpload.error ?? thumbUpload.error;
    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    setUrl(data.publicUrl);
  }

  return (
    <div className="field">
      <label htmlFor={`${name}-file`}>{label}</label>
      {/* The URL lives in a hidden field; mirror `required` onto a control the
          browser will actually validate, so an empty image blocks submission. */}
      <input type="hidden" name={name} value={url} />
      <input
        id={`${name}-file`}
        type="file"
        accept="image/*"
        onChange={onFile}
        disabled={busy}
        required={required && !url}
      />

      {busy ? <p className="hint">Uploading…</p> : null}
      {error ? <div className="notice err">{error}</div> : null}

      {url ? (
        <div style={{ display: "flex", gap: ".8rem", alignItems: "center", marginTop: ".5rem" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            style={{ width: 96, height: 60, objectFit: "cover", borderRadius: 3, border: "1px solid var(--line)" }}
          />
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setUrl("")}>
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
}
