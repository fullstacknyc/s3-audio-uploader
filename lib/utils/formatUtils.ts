// lib/utils/formatUtils.ts

/**
 * Format bytes to human-readable format
 * @param bytes Number of bytes
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted string with appropriate unit
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
}

/**
 * Format date to human-readable format (date only)
 * @param dateString ISO date string or Date object
 * @returns Formatted date string (e.g., "May 8, 2025")
 */
export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format date and time to human-readable format
 * @param dateString ISO date string or Date object
 * @returns Formatted date and time string (e.g., "May 8, 2025, 2:30 PM")
 */
export function formatDateTime(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Calculate days until a future date
 * @param futureDate ISO date string or Date object of a future date
 * @returns Number of days until the future date, or null if the date is invalid
 */
export function getDaysUntil(
  futureDate: string | Date | undefined
): number | null {
  if (!futureDate) return null;

  try {
    const future = new Date(futureDate);
    const now = new Date();

    // Check if the date is valid
    if (isNaN(future.getTime())) return null;

    const diffTime = future.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error("Error calculating days until date:", error);
    return null;
  }
}
