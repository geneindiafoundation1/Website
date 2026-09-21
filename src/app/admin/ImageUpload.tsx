"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

const BUCKET = "media";

/**
 * Uploads to Supabase Storage and stores the resulting public URL in a hidden
 * field, so the parent server action just reads a string.
 */
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
    const file = event.target.files?.[0];
    if (!file) return;

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("Image storage is not configured yet.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("That image is over 5 MB. Please use a smaller one.");
      return;
    }

    setBusy(true);
    setError(null);

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${name}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "31536000", upsert: false });

    setBusy(false);

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
