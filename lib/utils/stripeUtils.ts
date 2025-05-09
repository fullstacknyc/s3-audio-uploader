// lib/utils/stripeUtils.ts

// Function to generate a unique session ID
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}
