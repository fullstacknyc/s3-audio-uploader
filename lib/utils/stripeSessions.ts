// lib/utils/stripeSessions.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  GetCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB client
const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Default table name
const SESSIONS_TABLE =
  process.env.DYNAMODB_SESSIONS_TABLE || "audiocloud_stripe_sessions";

/**
 * Store a session ID for a Stripe checkout
 * @param sessionId Stripe checkout session ID or client reference ID
 * @param userId User ID associated with the session
 * @param planTier The plan tier being purchased
 * @param expiresAt When the session record should expire (TTL)
 * @returns Success status
 */
export async function storeStripeSession(
  sessionId: string,
  userId: string,
  planTier: string,
  expiresAt?: Date
): Promise<boolean> {
  try {
    // Create a TTL 24 hours in the future if not provided
    if (!expiresAt) {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
    }

    // Store the session in DynamoDB
    await ddbDocClient.send(
      new PutCommand({
        TableName: SESSIONS_TABLE,
        Item: {
          sessionId,
          userId,
          planTier,
          createdAt: new Date().toISOString(),
          // TTL in seconds since epoch
          ttl: Math.floor(expiresAt.getTime() / 1000),
        },
      })
    );

    return true;
  } catch (error) {
    console.error("Error storing Stripe session:", error);
    return false;
  }
}

/**
 * Get a stored session by ID
 * @param sessionId Stripe checkout session ID or client reference ID
 * @returns Session data if found
 */
export async function getStripeSession(sessionId: string): Promise<{
  userId: string;
  planTier: string;
  createdAt: string;
} | null> {
  try {
    const result = await ddbDocClient.send(
      new GetCommand({
        TableName: SESSIONS_TABLE,
        Key: { sessionId },
      })
    );

    if (result.Item) {
      return {
        userId: result.Item.userId,
        planTier: result.Item.planTier,
        createdAt: result.Item.createdAt,
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting Stripe session:", error);
    return null;
  }
}

/**
 * Verify that a session belongs to a user
 * @param sessionId Stripe checkout session ID or client reference ID
 * @param userId User ID to verify against
 * @returns Whether the session belongs to the user
 */
export async function verifyStripeSessionOwnership(
  sessionId: string,
  userId: string
): Promise<boolean> {
  try {
    const session = await getStripeSession(sessionId);
    return session !== null && session.userId === userId;
  } catch (error) {
    console.error("Error verifying session ownership:", error);
    return false;
  }
}
