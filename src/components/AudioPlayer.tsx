"use client";

import { useEffect, useRef, useState } from "react";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({
  src,
  duration,
}: {
  src: string;
  duration?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrent(audio.currentTime);
    const onMeta = () => setTotal(audio.duration);
    const onEnd = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Number(e.target.value);
    audio.currentTime = value;
    setCurrent(value);
  }

  const totalDisplay = total ? formatTime(total) : duration ?? "0:00";

  return (
    <div
      className="rounded-lg px-5 py-4 mb-10 flex items-center gap-4"
      style={{ background: "var(--paper-raised)" }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        onClick={togglePlay}
        aria-label={playing ? "暂停" : "播放"}
        className="shrink-0 rounded-full flex items-center justify-center"
        style={{
          width: 40,
          height: 40,
          background: "var(--accent-deep)",
          color: "var(--paper-raised)",
        }}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <rect x="2" y="1" width="4" height="12" />
            <rect x="8" y="1" width="4" height="12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <polygon points="2,1 13,7 2,13" />
          </svg>
        )}
      </button>
      <div className="flex-1 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={total || 0}
          value={current}
          onChange={seek}
          className="flex-1"
          style={{ accentColor: "var(--accent-deep)" }}
        />
        <span
          className="eyebrow shrink-0"
          style={{ color: "var(--ink-faint)", minWidth: 80, textAlign: "right" }}
        >
          {formatTime(current)} / {totalDisplay}
        </span>
      </div>
    </div>
  );
}
