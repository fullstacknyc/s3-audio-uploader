// lib/utils/tutorialUtils.ts

import { TutorialWithoutContent } from "../content/tutorials/tutorial-types";

// Function to get YouTube thumbnail URL
export function getYouTubeThumbnail(
  tutorial: TutorialWithoutContent,
  quality: "max" | "high" | "medium"
): string {
  // If the tutorial has a videoId, use the YouTube thumbnail URL
  if (tutorial.videoId) {
    const imgName =
      quality == "max"
        ? "maxresdefault.jpg"
        : quality == "high"
        ? "hqdefault.jpg"
        : "mqdefault.jpg";
    return `https://img.youtube.com/vi/${tutorial.videoId}/${imgName}`;
  }
  // If the tutorial has a thumbnail property, use that
  else if (tutorial.thumbnail && !tutorial.thumbnail.startsWith("/")) {
    return tutorial.thumbnail;
  }
  // Otherwise, return a default placeholder image path
  return `/tutorials/${tutorial.id}-thumbnail.jpg`;
}
