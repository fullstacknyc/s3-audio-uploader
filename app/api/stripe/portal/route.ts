// app/api/stripe/portal/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import Stripe from "stripe";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

// Initialize DynamoDB client
const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Authentication cookie name
const AUTH_COOKIE_NAME = "audiocloud_auth";

export async function GET(request: Request) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const returnUrl =
      searchParams.get("return_url") ||
      `${process.env.NEXT_PUBLIC_FRONTEND_URL}/dashboard`;

    // First, get the user's Stripe customer ID from DynamoDB
    const userResult = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.DYNAMODB_USERS_TABLE!,
        Key: { userId },
      })
    );

    const userData = userResult.Item;
    if (!userData || !userData.stripeCustomerId) {
      return NextResponse.json(
        {
          success: false,
          message: "No Stripe customer ID found for this user",
        },
        { status: 404 }
      );
    }

    // Create a portal session with Stripe
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userData.stripeCustomerId,
      return_url: returnUrl,
    });

    // Always return the portal URL in JSON format
    return NextResponse.json({
      success: true,
      url: portalSession.url,
    });
  } catch (error) {
    console.error("Error creating portal session:", error);

    // Return an error response
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create customer portal session",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
