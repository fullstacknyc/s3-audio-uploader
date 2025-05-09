// app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  UpdateCommand,
  DynamoDBDocumentClient,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import Stripe from "stripe";
import { getStripeSession } from "@/lib/utils/stripeSessions";

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

// Get plan tier from Stripe product details
async function getPlanTierFromProduct(
  productId: string
): Promise<"pro" | "studio" | "free"> {
  try {
    // Retrieve the product details from Stripe
    const product = await stripe.products.retrieve(productId);

    // Check the product name or metadata to determine the tier
    const productName = product.name.toLowerCase();

    if (productName.includes("pro")) return "pro";
    if (productName.includes("studio")) return "studio";

    // If the product name doesn't contain recognizable tier names,
    // check for metadata that might indicate the tier
    if (product.metadata && product.metadata.tier) {
      const metadataTier = product.metadata.tier.toLowerCase();
      if (metadataTier === "pro") return "pro";
      if (metadataTier === "studio") return "studio";
    }

    return "free";
  } catch (error) {
    console.error("Error getting plan tier from product:", error);
    return "free"; // Default to free tier in case of error
  }
}

// Find user by Stripe customer ID
async function findUserByStripeCustomerId(
  customerId: string
): Promise<string | null> {
  try {
    // Query the users table by Stripe customer ID
    const result = await ddbDocClient.send(
      new QueryCommand({
        TableName: process.env.DYNAMODB_USERS_TABLE!,
        IndexName: "StripeCustomerIdIndex", // Assuming you have a GSI on stripeCustomerId
        KeyConditionExpression: "stripeCustomerId = :customerId",
        ExpressionAttributeValues: {
          ":customerId": customerId,
        },
        Limit: 1,
      })
    );

    if (result.Items && result.Items.length > 0) {
      return result.Items[0].userId;
    }

    return null;
  } catch (error) {
    console.error("Error finding user by Stripe customer ID:", error);
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

// Store Stripe customer ID with user
async function storeStripeCustomerId(userId: string, customerId: string) {
  try {
    await ddbDocClient.send(
      new UpdateCommand({
        TableName: process.env.DYNAMODB_USERS_TABLE!,
        Key: { userId },
        UpdateExpression:
          "SET stripeCustomerId = :customerId, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":customerId": customerId,
          ":updatedAt": new Date().toISOString(),
        },
      })
    );
    return true;
  } catch (error) {
    console.error("Error storing Stripe customer ID:", error);
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

        // Extract user ID - preferably from metadata, then client_reference_id
        let userId =
          session.metadata?.user_id ||
          session.metadata?.userId ||
          session.client_reference_id;

        // If not found in metadata or client_reference_id, check our session store
        if (!userId && session.metadata?.sessionId) {
          try {
            const storedSession = await getStripeSession(
              session.metadata.sessionId
            );
            if (storedSession) {
              userId = storedSession.userId;
            }
          } catch (err) {
            console.error("Error retrieving stored session:", err);
          }
        }

        if (!userId) {
          console.error(
            "Could not identify user from checkout session:",
            session.id
          );
          return NextResponse.json(
            { error: "User identification failed" },
            { status: 400 }
          );
        }

        // Get plan from metadata or line items
        let planTier: "pro" | "studio" | "free" = "free";

        // First check metadata
        if (session.metadata?.plan) {
          planTier = session.metadata.plan.toLowerCase() as
            | "pro"
            | "studio"
            | "free";
        } else {
          // If not in metadata, get it from line items
          const lineItems = await stripe.checkout.sessions.listLineItems(
            session.id
          );

          if (lineItems.data.length) {
            // Get the price ID from the first line item
            const priceId = lineItems.data[0].price?.id;

            if (priceId) {
              // Get the price details
              const price = await stripe.prices.retrieve(priceId);
              // Get the product ID
              const productId = price.product as string;

              // Determine plan tier from product name or metadata
              planTier = await getPlanTierFromProduct(productId);
            }
          }
        }

        // Store the Stripe customer ID with the user for future reference
        if (session.customer) {
          await storeStripeCustomerId(userId, session.customer as string);
        }

        // Update the user's tier in your database
        const updated = await updateUserTier(userId, planTier);

        if (!updated) {
          console.error(`Failed to update user ${userId} to ${planTier} tier`);
          return NextResponse.json(
            { error: "User update failed" },
            { status: 500 }
          );
        }

        console.log(`Successfully upgraded user ${userId} to ${planTier} tier`);
        break;
      }

      case "customer.subscription.updated": {
        // Handle subscription updates (e.g., plan changes, cancellations)
        const subscription = event.data.object as Stripe.Subscription;

        // Extract customer ID
        const customerId = subscription.customer as string;

        // Find the user associated with this Stripe customer
        const userId = await findUserByStripeCustomerId(customerId);

        if (!userId) {
          console.error(
            `Could not find user for Stripe customer: ${customerId}`
          );
          return NextResponse.json(
            { error: "User not found for customer" },
            { status: 400 }
          );
        }

        // Handle different subscription statuses
        if (subscription.status === "active") {
          // Subscription is active - update user's tier based on the product
          const productId = subscription.items.data[0].price.product as string;
          const planTier = await getPlanTierFromProduct(productId);
          await updateUserTier(userId, planTier);
          console.log(
            `Updated user ${userId} to ${planTier} tier based on active subscription`
          );
        } else if (
          subscription.status === "canceled" ||
          subscription.status === "unpaid"
        ) {
          // Subscription canceled or unpaid - downgrade user to free tier
          await updateUserTier(userId, "free");
          console.log(
            `Downgraded user ${userId} to free tier due to ${subscription.status} subscription`
          );
        }

        break;
      }

      case "customer.subscription.deleted": {
        // Handle subscription deletion
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID
        const userId = await findUserByStripeCustomerId(customerId);

        if (userId) {
          // Downgrade user to free tier
          await updateUserTier(userId, "free");
          console.log(
            `Downgraded user ${userId} to free tier due to subscription deletion`
          );
        } else {
          console.error(
            `Could not find user for Stripe customer: ${customerId}`
          );
        }

        break;
      }

      case "invoice.payment_failed": {
        // Handle failed payments
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find user by customer ID
        const userId = await findUserByStripeCustomerId(customerId);

        if (userId) {
          // Potentially notify the user or take other actions
          console.log(`Payment failed for user ${userId}`);

          // If this is a final payment attempt, you might downgrade the user
          if (invoice.next_payment_attempt === null) {
            await updateUserTier(userId, "free");
            console.log(
              `Downgraded user ${userId} to free tier due to final payment failure`
            );
          }
        }

        break;
      }
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
