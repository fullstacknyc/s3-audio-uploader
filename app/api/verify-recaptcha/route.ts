import { NextResponse } from "next/server";

// Define a type for the expected reCAPTCHA verification response
interface ReCaptchaVerificationResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number;
  action?: string;
  "error-codes"?: string[];
}

export async function POST(request: Request) {
  try {
    // Parse the request body with proper error handling
    let body;
    try {
      body = await request.json();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    const { recaptchaToken } = body;

    // Validate reCAPTCHA token
    if (!recaptchaToken || typeof recaptchaToken !== "string") {
      return NextResponse.json(
        { error: "reCAPTCHA token is missing or invalid" },
        { status: 400 }
      );
    }

    // Rate limiting - could be enhanced with proper Redis-based rate limiting in production
    // This is a simple in-memory implementation that will reset on server restart
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    const MAX_REQUESTS = 10;
    const WINDOW_MS = 60 * 1000; // 1 minute

    // Simulating rate limiting check (in production, use a proper solution)
    if (exceedsRateLimit(ipAddress, MAX_REQUESTS, WINDOW_MS)) {
      return NextResponse.json(
        { error: "Too many verification attempts, please try again later" },
        { status: 429 }
      );
    }

    // Verify reCAPTCHA token with Google
    const recaptchaVerification = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY || "",
          response: recaptchaToken,
        }).toString(),
      }
    );

    if (!recaptchaVerification.ok) {
      throw new Error("Failed to verify reCAPTCHA with Google");
    }

    const recaptchaResult =
      (await recaptchaVerification.json()) as ReCaptchaVerificationResponse;

    if (!recaptchaResult.success) {
      // Return specific error information
      return NextResponse.json(
        {
          error: "reCAPTCHA verification failed",
          details:
            recaptchaResult["error-codes"] || "Unknown verification error",
        },
        { status: 400 }
      );
    }

    // For v3 reCAPTCHA, check the score if available
    if (recaptchaResult.score !== undefined && recaptchaResult.score < 0.5) {
      return NextResponse.json(
        {
          error: "reCAPTCHA score too low",
          score: recaptchaResult.score,
        },
        { status: 400 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      hostname: recaptchaResult.hostname, // Return hostname for additional verification on client
    });
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);

    // Return error response
    return NextResponse.json(
      { error: "Failed to verify reCAPTCHA. Please try again." },
      { status: 500 }
    );
  }
}

// Simple in-memory rate limiting implementation
// In production, you would use a proper rate limiting solution with Redis
const requestLog: Record<string, number[]> = {};

function exceedsRateLimit(
  ip: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();

  // Initialize or clean old requests
  requestLog[ip] = (requestLog[ip] || []).filter(
    (time) => time > now - windowMs
  );

  // Check if rate limit is exceeded
  if (requestLog[ip].length >= maxRequests) {
    return true;
  }

  // Add current request timestamp
  requestLog[ip].push(now);
  return false;
}
