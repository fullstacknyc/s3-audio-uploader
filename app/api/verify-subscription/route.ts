// app/api/verify-subscription/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  GetCommand,
  UpdateCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import Stripe from "stripe";
import { verifyStripeSessionOwnership } from "@/lib/utils/stripeSessions";

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

// Fetch the Stripe subscription status
async function fetchSubscriptionDetails(userId: string) {
  try {
    // First, get the user record to find the Stripe customer ID
    const userResult = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.DYNAMODB_USERS_TABLE!,
        Key: { userId },
      })
    );

    const userData = userResult.Item;
    if (!userData) {
      return null;
    }

    // If the user has a Stripe customer ID, fetch their subscriptions
    if (userData.stripeCustomerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: userData.stripeCustomerId,
        status: "active",
        expand: ["data.default_payment_method"],
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0];

        // Get the product ID from the subscription
        const productId = subscription.items.data[0].price.product as string;

        // Get the product details to determine the plan
        const product = await stripe.products.retrieve(productId);

        // Create a customer portal session URL
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: userData.stripeCustomerId,
          return_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/dashboard`,
        });

        return {
          subscriptionId: subscription.id,
          status: subscription.status,
          productId,
          productName: product.name,
          customerPortalUrl: portalSession.url,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching subscription details:", error);
    return null;
  }
}

// Map Stripe product ID to plan tier
function getPlanTierFromProduct(
  productName: string
): "pro" | "studio" | "free" {
  const lowerName = productName.toLowerCase();
  if (lowerName.includes("pro")) return "pro";
  if (lowerName.includes("studio")) return "studio";
  return "free";
}

// Update user tier if webhook hasn't done it yet
async function updateUserTierIfNeeded(userId: string, expectedTier: string) {
  try {
    const userResult = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.DYNAMODB_USERS_TABLE!,
        Key: { userId },
      })
    );

    const userData = userResult.Item;
    if (!userData) {
      return false;
    }

    // Check if the user's tier matches the expected tier
    if (userData.tier !== expectedTier) {
      // Update the user's tier
      await ddbDocClient.send(
        new UpdateCommand({
          TableName: process.env.DYNAMODB_USERS_TABLE!,
          Key: { userId },
          UpdateExpression: "SET tier = :tier, updatedAt = :updatedAt",
          ExpressionAttributeValues: {
            ":tier": expectedTier,
            ":updatedAt": new Date().toISOString(),
          },
        })
      );

      return true;
    }

    return false;
  } catch (error) {
    console.error("Error updating user tier:", error);
    return false;
  }
}

// Check for checkout session completion in Stripe
async function checkCheckoutSession(sessionId: string) {
  try {
    // Check if this is a valid Stripe Checkout Session ID
    if (sessionId.startsWith("cs_")) {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items", "customer", "subscription"],
      });

      if (session.status === "complete") {
        const subscription = session.subscription as Stripe.Subscription | null;

        if (subscription) {
          // This was a subscription checkout
          return {
            completed: true,
            customerId: session.customer as string,
            subscriptionId:
              typeof subscription === "string" ? subscription : subscription.id,
          };
        } else {
          // This was a one-time payment
          return {
            completed: true,
            customerId: session.customer as string,
          };
        }
      }

      return { completed: false };
    }

    // For client reference IDs (not Stripe session IDs)
    return { completed: false };
  } catch (error) {
    console.error("Error checking checkout session:", error);
    return { completed: false, error: true };
  }
}

export async function GET(request: Request) {
  try {
    // Get the session ID and plan from the URL parameters
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const expectedPlan = searchParams.get("plan");

    // Validate required parameters
    if (!sessionId || !expectedPlan) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get the auth token to identify the user
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Extract user ID from the token
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

    // Verify that this session belongs to the current user for security
    // First, check our session storage
    const isValidSession = await verifyStripeSessionOwnership(
      sessionId,
      userId
    );

    // If not in our session storage and not a client-generated session ID, check with Stripe
    if (!isValidSession && !sessionId.startsWith("session_")) {
      if (sessionId.startsWith("cs_")) {
        try {
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          // If the client_reference_id doesn't match our user ID, it's not valid
          if (session.client_reference_id !== userId) {
            return NextResponse.json(
              { success: false, message: "Invalid session" },
              { status: 403 }
            );
          }
        } catch (error) {
          console.error("Error verifying Stripe session:", error);
          return NextResponse.json(
            { success: false, message: "Invalid session" },
            { status: 403 }
          );
        }
      } else {
        // Unknown session ID format
        return NextResponse.json(
          { success: false, message: "Invalid session format" },
          { status: 403 }
        );
      }
    }

    // Check if this is a Stripe Checkout Session ID
    if (sessionId.startsWith("cs_")) {
      const checkoutStatus = await checkCheckoutSession(sessionId);

      if (checkoutStatus.error) {
        return NextResponse.json(
          { success: false, message: "Error checking session status" },
          { status: 500 }
        );
      }

      if (!checkoutStatus.completed) {
        return NextResponse.json({
          success: true,
          verified: false,
          message: "Payment not yet completed",
        });
      }
    }

    // Fetch the user's current subscription status from Stripe
    const subscriptionDetails = await fetchSubscriptionDetails(userId);

    // Verify that the user has the correct tier
    const userResult = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.DYNAMODB_USERS_TABLE!,
        Key: { userId },
      })
    );

    const userData = userResult.Item;
    if (!userData) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const userTier = userData.tier || "free";
    const expectedTier = expectedPlan.toLowerCase();

    // If subscription details are available, use them to determine the current tier
    let verified = false;
    let actualTier = userTier;
    let subscriptionId;
    let customerPortalUrl;

    if (subscriptionDetails) {
      actualTier = getPlanTierFromProduct(subscriptionDetails.productName);
      subscriptionId = subscriptionDetails.subscriptionId;
      customerPortalUrl = subscriptionDetails.customerPortalUrl;

      // If Stripe shows an active subscription for the expected tier, we're verified
      if (actualTier === expectedTier) {
        verified = true;
      }

      // If user's tier in DB doesn't match Stripe, update it
      if (userTier !== actualTier) {
        await updateUserTierIfNeeded(userId, actualTier);
      }
    } else {
      // No subscription found in Stripe, check if the DB tier matches expected
      verified = userTier === expectedTier;

      // If not verified but expected a paid tier, try to update the user's tier
      if (!verified && (expectedTier === "pro" || expectedTier === "studio")) {
        // This is a fallback in case the webhook hasn't processed yet
        const updated = await updateUserTierIfNeeded(userId, expectedTier);
        if (updated) {
          verified = true;
          actualTier = expectedTier;
        }
      }
    }

    return NextResponse.json({
      success: true,
      verified,
      message: verified
        ? "Subscription verified"
        : "Subscription status pending webhook confirmation",
      tier: actualTier,
      subscriptionId,
      customerPortalUrl,
      userId,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify subscription status",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
