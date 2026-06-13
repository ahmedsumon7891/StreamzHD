"use client";
import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@videojs/http-streaming";
import type Player from "video.js/dist/types/player";

interface Props {
  streamUrl: string;
  channelName: string;
  logoUrl?: string | null;
}

export default function VideoPlayer({ streamUrl, channelName, logoUrl }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    if (!videoRef.current) return;
    const isHls = /\.m3u8(\?|$)/i.test(streamUrl);
    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: true,
      preload: "auto",
      fluid: true,
      responsive: true,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      html5: { vhs: { overrideNative: true } },
      sources: [{ src: streamUrl, type: isHls ? "application/x-mpegURL" : "video/mp4" }],
      poster: logoUrl || undefined,
    });
    playerRef.current = player;

    player.on("error", () => {
      if (retries < 3) {
        setTimeout(() => {
          setRetries((r) => r + 1);
          player.src({ src: streamUrl, type: isHls ? "application/x-mpegURL" : "video/mp4" });
          player.play()?.catch(() => undefined);
        }, 3000);
      }
    });

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") { e.preventDefault(); player.paused() ? player.play() : player.pause(); }
      else if (e.key.toLowerCase() === "f") player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen();
      else if (e.key.toLowerCase() === "m") player.muted(!player.muted());
      else if (e.key === "ArrowUp") player.volume(Math.min(1, (player.volume() || 0) + 0.1));
      else if (e.key === "ArrowDown") player.volume(Math.max(0, (player.volume() || 0) - 0.1));
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      if (playerRef.current) { playerRef.current.dispose(); playerRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamUrl]);

  return (
    <div className="w-full bg-black rounded-xl overflow-hidden border border-border" data-vjs-player>
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        playsInline
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore — non-standard AirPlay attribute
        x-webkit-airplay="allow"
        aria-label={channelName}
      />
    </div>
  );
}
