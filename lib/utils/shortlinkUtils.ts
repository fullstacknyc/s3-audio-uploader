// lib/utils/shortlinkUtils.ts

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
