// lib/utils/audioFormatUtils.ts

import { AUDIO_FORMAT_LABELS } from "../constants/plans";

/**
 * Get user-friendly format labels for all supported formats
 */
export function getSupportedFormatLabels(): string[] {
  return [...new Set(Object.values(AUDIO_FORMAT_LABELS))];
}
