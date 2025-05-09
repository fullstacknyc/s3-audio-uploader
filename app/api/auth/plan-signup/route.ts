// app/api/auth/plan-signup/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { storeStripeSession } from "@/lib/utils/stripeSessions";

// Authentication cookie name
const AUTH_COOKIE_NAME = "audiocloud_auth";

export async function POST(request: Request) {
  try {
    // Get auth cookie to check if user is authenticated
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token and extract user ID
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
    const { plan, sessionId, redirectUrl } = await request.json();

    // Validate required fields
    if (!plan || !sessionId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate plan
    if (!["pro", "studio"].includes(plan.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: "Invalid plan tier" },
        { status: 400 }
      );
    }

    // Store the session with user ID and plan
    const success = await storeStripeSession(
      sessionId,
      userId,
      plan.toLowerCase()
    );

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Failed to store session" },
        { status: 500 }
      );
    }

    // Return success with redirect URL if provided
    return NextResponse.json({
      success: true,
      message: "Plan signup session stored successfully",
      redirectUrl: redirectUrl || null,
    });
  } catch (error) {
    console.error("Error processing plan signup:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing your plan signup",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
