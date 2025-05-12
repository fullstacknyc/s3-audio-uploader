// app/components/YouTubePlayer.tsx
"use client";

import { useState } from "react";
import styles from "./YouTubePlayer.module.css";
import { FiPlay } from "react-icons/fi";

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
}

export default function YouTubePlayer({ videoId, title }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  if (!videoId) {
    return (
      <div className={styles.videoPlaceholder}>
        <div className={styles.playButton}>No Video Available</div>
      </div>
    );
  }

  return (
    <div className={styles.videoContainer}>
      {!isPlaying ? (
        <div
          className={styles.videoThumbnail}
          style={{
            backgroundImage: `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)`,
          }}
          onClick={handlePlay}
          role="button"
          aria-label={`Play ${title || "video"}`}
        >
          <button className={styles.playButton}>
            <FiPlay size={24} />
            <span>Play Video</span>
          </button>
        </div>
      ) : (
        <iframe
          className={styles.videoFrame}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title || "YouTube Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      )}
    </div>
  );
}
