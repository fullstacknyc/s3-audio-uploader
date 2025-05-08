// lib/models/Shortlink.ts

/**
 * Interface for the shortlink database object
 */
export interface Shortlink {
  id: string;
  shortCode: string;
  originalUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  userId: string | null; // Can be null for anonymous users
  isAnonymous: boolean;
  createdAt: string; // ISO date string
  expiresAt?: string; // Optional, ISO date string
  downloadCount: number;
  storageKey: string;
}

/**
 * Interface for creating a new shortlink
 */
export interface CreateShortlinkData {
  originalUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  userId?: string; // Optional, if anonymous
  storageKey?: string; // For S3 file deletion later
}
