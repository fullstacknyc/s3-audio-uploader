// lib/constants/plans.ts

/**
 * Define user plan types
 */
export type PlanTier = "free" | "pro" | "studio";

/**
 * Storage limits for each plan tier in bytes
 */
export const STORAGE_LIMITS: Record<PlanTier, number> = {
  free: 5 * 1024 * 1024 * 1024, // 5GB in bytes
  pro: 100 * 1024 * 1024 * 1024, // 100GB in bytes
  studio: 1024 * 1024 * 1024 * 1024, // 1TB in bytes
};

/**
 * File size limits for each plan tier in bytes
 */
export const FILE_SIZE_LIMITS: Record<PlanTier, number> = {
  free: 100 * 1024 * 1024, // 100MB per file
  pro: 1 * 1024 * 1024 * 1024, // 1GB per file
  studio: 10 * 1024 * 1024 * 1024, // 10GB per file
};

/**
 * Monthly pricing for each plan tier in USD
 */
export const PLAN_PRICES: Record<PlanTier, number> = {
  free: 0,
  pro: 12.99,
  studio: 29.99,
};

/**
 * Features for each plan tier
 */
export const PLAN_FEATURES: Record<PlanTier, string[]> = {
  free: [
    "5GB secure cloud storage",
    "MP3 & WAV format support",
    "Basic file organization",
    "Standard download speeds",
    "Community forum support",
  ],
  pro: [
    "100GB secure cloud storage",
    "All audio format support including FLAC, AIFF",
    "Advanced file organization with tags",
    "Unlimited file sharing with access controls",
    "Priority email support",
    "Automatic backups",
  ],
  studio: [
    "1TB secure cloud storage",
    "All audio formats with lossless streaming",
    "Advanced file organization with custom metadata",
    "Team collaboration tools and permissions",
    "Priority 24/7 support",
    "Automatic backups with version history",
    "API access for custom integrations",
  ],
};

/**
 * Download link expiry times for presigned URLs (in seconds)
 */
export const DOWNLOAD_EXPIRY_TIMES: Record<PlanTier, number> = {
  free: 60 * 60 * 24, // 24 hours for free tier
  pro: 60 * 60 * 24 * 7, // 7 days for pro tier
  studio: 60 * 60 * 24 * 30, // 30 days for studio tier
};

/**
 * Maximum file size (in bytes) for client-side validation
 * This should match the FILE_SIZE_LIMITS.free value
 */
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Supported audio file formats for upload
 */
export const SUPPORTED_AUDIO_FORMATS = [
  "audio/mpeg", // MP3
  "audio/wav", // WAV
  "audio/aac", // AAC
  "audio/x-m4a", // M4A
  "audio/ogg", // OGG
  "audio/flac", // FLAC
  "audio/x-flac", // Alternative FLAC MIME type
  "audio/aiff", // AIFF
  "audio/x-aiff", // Alternative AIFF MIME type
];

/**
 * Mapping between MIME types and user-friendly file extensions
 */
export const AUDIO_FORMAT_LABELS: Record<string, string> = {
  "audio/mpeg": "MP3",
  "audio/wav": "WAV",
  "audio/aac": "AAC",
  "audio/x-m4a": "M4A",
  "audio/ogg": "OGG",
  "audio/flac": "FLAC",
  "audio/x-flac": "FLAC",
  "audio/aiff": "AIFF",
  "audio/x-aiff": "AIFF",
};
