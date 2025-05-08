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

/**
 * Generate a random short code for the URL
 * @param length The length of the short code (default: 6)
 * @returns A random alphanumeric string
 */
export function generateShortCode(length: number = 6): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = chars.length;

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
