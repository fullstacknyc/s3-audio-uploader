import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { recaptchaToken } = body;

    // Validate reCAPTCHA token
    if (!recaptchaToken) {
      return NextResponse.json(
        { error: "reCAPTCHA token is missing" },
        { status: 400 }
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

    const recaptchaResult = await recaptchaVerification.json();

    if (!recaptchaResult.success) {
      return NextResponse.json(
        {
          error: "reCAPTCHA verification failed",
          details: recaptchaResult["error-codes"],
        },
        { status: 400 }
      );
    }

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);

    // Return error response
    return NextResponse.json(
      { error: "Failed to verify reCAPTCHA. Please try again." },
      { status: 500 }
    );
  }
}
