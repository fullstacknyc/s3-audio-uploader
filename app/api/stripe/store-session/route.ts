// app/api/stripe/store-session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { storeStripeSession } from "@/lib/utils/stripeSessions";

// Authentication cookie name
const AUTH_COOKIE_NAME = "audiocloud_auth";

export async function POST(request: Request) {
  try {
    // Get auth cookie
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify the token and extract user ID
    let userId;
    try {
      const payload = jose.decodeJwt(token);
      userId = payload.sub;

      if (!userId) {
        throw new Error("User ID not found in token");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      return NextResponse.json(
        { success: false, message: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Parse request body
    const { sessionId, planTier } = await request.json();

    // Validate required fields
    if (!sessionId || !planTier) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate plan tier
    if (!["pro", "studio"].includes(planTier.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: "Invalid plan tier" },
        { status: 400 }
      );
    }

    // Store the session
    const success = await storeStripeSession(
      sessionId,
      userId,
      planTier.toLowerCase()
    );

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Failed to store session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Session stored successfully",
    });
  } catch (error) {
    console.error("Error storing Stripe session:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while storing the session",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
