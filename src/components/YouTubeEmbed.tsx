"use client";

import { useState } from "react";

/**
 * Click-to-play YouTube embed. The iframe is created only after a click so the
 * page does not pull two players (and their cookies) on first paint.
 *
 * Thumbnails step down from max-res: YouTube often returns HTTP 200 with a
 * 120×90 placeholder when maxresdefault.jpg does not exist for a video.
 */
const THUMBS = ["maxresdefault", "hq720", "sddefault", "hqdefault"] as const;

function PosterImage({ videoId }: { videoId: string }) {
  const [level, setLevel] = useState(0);
  const file = THUMBS[Math.min(level, THUMBS.length - 1)];

  function next() {
    setLevel((n) => Math.min(n + 1, THUMBS.length - 1));
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://i.ytimg.com/vi/${videoId}/${file}.jpg`}
      alt=""
      onError={next}
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth <= 120 && level < THUMBS.length - 1) {
          next();
        }
      }}
    />
  );
}

export function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <figure className="yt">
      <div className="yt-frame">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&vq=hd720`}
            title={title}
            width={1280}
            height={720}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="yt-poster"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${title}`}
          >
            <PosterImage videoId={videoId} />
            <span className="yt-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path fill="currentColor" d="M8 5.14v13.72L19.12 12 8 5.14Z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <figcaption>
        Director&rsquo;s message
        <a href={watchUrl} target="_blank" rel="noopener noreferrer">
          Watch on YouTube
        </a>
      </figcaption>
    </figure>
  );
}
