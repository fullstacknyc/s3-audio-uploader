import crypto from "crypto";

/**
 * Calculates the SECRET_HASH required for Cognito when a client secret is enabled
 *
 * @param username - The username (typically email) of the user
 * @param clientId - The Cognito App Client ID
 * @param clientSecret - The Cognito App Client Secret
 * @returns The calculated SECRET_HASH as a base64 string
 */
export function calculateSecretHash(
  username: string,
  clientId: string,
  clientSecret: string
): string {
  const message = username + clientId;
  const hmac = crypto.createHmac("sha256", clientSecret);
  hmac.update(message);
  return hmac.digest("base64");
}
