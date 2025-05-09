// app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  UpdateCommand,
  DynamoDBDocumentClient,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil", // Use the latest Stripe API version
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

// Parse the Stripe event and verify the signature
async function parseAndVerifyStripeEvent(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  try {
    // Verify webhook signature using Stripe webhook secret
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    return event;
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err);
    throw new Error(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}`
    );
  }
}

// Get plan tier from Stripe product or price ID
function getPlanTierFromStripe(productId: string): "pro" | "studio" | "free" {
  // Map Stripe product IDs to plan tiers
  // These should match your actual Stripe product IDs
  const productMap: Record<string, "pro" | "studio" | "free"> = {
    prod_YOUR_PRO_PRODUCT_ID: "pro",
    prod_YOUR_STUDIO_PRODUCT_ID: "studio",
    // Add more mappings as needed
  };

  return productMap[productId] || "free";
}

// Find the user ID associated with a checkout session
async function findUserBySessionId(sessionId: string) {
  // You need to implement this based on your database structure
  // For example, you might store sessionId in your user record or in a separate table

  // For a proper implementation, you would:
  // 1. Query a table that maps session IDs to user IDs
  // 2. Or retrieve the user ID from Stripe metadata if you stored it there

  // This is a placeholder implementation
  try {
    const result = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.DYNAMODB_SESSIONS_TABLE || "sessions",
        Key: { sessionId },
      })
    );

    return result.Item?.userId;
  } catch (error) {
    console.error("Error finding user by session ID:", error);
    return null;
  }
}

// Update the user's tier in DynamoDB
async function updateUserTier(userId: string, tier: "pro" | "studio" | "free") {
  try {
    // Update the user record in DynamoDB
    await ddbDocClient.send(
      new UpdateCommand({
        TableName: process.env.DYNAMODB_USERS_TABLE!,
        Key: { userId },
        UpdateExpression: "SET tier = :tier, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":tier": tier,
          ":updatedAt": new Date().toISOString(),
        },
      })
    );

    return true;
  } catch (error) {
    console.error("Error updating user tier:", error);
    return false;
  }
}

// Main webhook handler
export async function POST(req: Request) {
  try {
    // 1. Parse and verify the Stripe event
    const event = await parseAndVerifyStripeEvent(req);

    // 2. Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Extract user ID - either from client_reference_id or session metadata
        let userId = session.client_reference_id;

        // If not found in client_reference_id, check session metadata
        if (!userId && session.metadata?.userId) {
          userId = session.metadata.userId;
        }

        // If still not found, try to find the user by session ID
        if (!userId && session.id) {
          userId = await findUserBySessionId(session.id);
        }

        if (!userId) {
          throw new Error("Could not identify user from checkout session");
        }

        // Get the Stripe product/price ID to determine the plan tier
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id
        );
        if (!lineItems.data.length) {
          throw new Error("No line items found in checkout session");
        }

        // Get the price from the first line item
        const priceId = lineItems.data[0].price?.id;
        if (!priceId) {
          throw new Error("Price ID not found in line item");
        }

        // Get the product details from the price
        const price = await stripe.prices.retrieve(priceId);
        const productId = price.product as string;

        // Determine the plan tier based on the product
        const planTier = getPlanTierFromStripe(productId);

        // Update the user's tier in your database
        const updated = await updateUserTier(userId, planTier);

        if (!updated) {
          throw new Error(
            `Failed to update user ${userId} to ${planTier} tier`
          );
        }

        console.log(`Successfully upgraded user ${userId} to ${planTier} tier`);
        break;
      }

      case "customer.subscription.updated": {
        // Handle subscription updates (e.g., plan changes, cancellations)
        const subscription = event.data.object as Stripe.Subscription;

        // Extract customer ID
        // const customerId = subscription.customer as string;

        // Find the user associated with this Stripe customer
        // This would require a function to look up users by Stripe customer ID
        // const userId = await findUserByStripeCustomerId(customerId);

        // Handle different subscription statuses
        if (subscription.status === "active") {
          // Subscription is active - update user's tier if changed
          // const planTier = getPlanTierFromStripe(subscription.items.data[0].price.product as string);
          // await updateUserTier(userId, planTier);
        } else if (subscription.status === "canceled") {
          // Subscription canceled - downgrade user to free tier
          // await updateUserTier(userId, "free");
        }

        break;
      }

      // Add more event handlers as needed
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
