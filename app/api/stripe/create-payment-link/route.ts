// app/api/stripe/create-payment-link/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import Stripe from "stripe";
import { storeStripeSession } from "@/lib/utils/stripeSessions";
import { generateSessionId } from "@/lib/utils/stripeUtils";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

// Authentication cookie name
const AUTH_COOKIE_NAME = "audiocloud_auth";

// Define plan prices (these should match your Stripe price IDs)
const PLAN_PRICES = {
  pro: process.env.STRIPE_PRO_PRICE_ID || "price_pro123456",
  studio: process.env.STRIPE_STUDIO_PRICE_ID || "price_studio123456",
};

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

    // Verify token and extract user ID and email
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
    const { plan, email } = await request.json();

    // Validate plan
    if (!plan || !["pro", "studio"].includes(plan.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // Generate a unique session ID for tracking
    const sessionId = generateSessionId();

    // Store session for verification later
    await storeStripeSession(sessionId, userId as string, plan);

    // Base URL for the application
    const baseUrl =
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      "https://s3-audio-uploader.vercel.app";

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: PLAN_PRICES[plan as "pro" | "studio"],
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/payment-success?plan=${plan}&session_id=${sessionId}`,
      cancel_url: `${baseUrl}/paid-plans?cancel=true`,
      client_reference_id: userId as string,
      customer_email: email,
      metadata: {
        userId: userId as string,
        plan,
        sessionId,
      },
      subscription_data: {
        metadata: {
          userId: userId as string,
          plan,
          sessionId,
        },
      },
    });

    // Return the session ID and URL
    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
      appSessionId: sessionId, // Our internal session ID
    });
  } catch (error) {
    console.error("Error creating payment link:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create payment link",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
