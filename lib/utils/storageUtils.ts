// lib/utils/storageUtils.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  UpdateCommand,
  GetCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { STORAGE_LIMITS } from "@/lib/constants/plans";
import type { PlanTier } from "@/lib/constants/plans";

// Initialize DynamoDB client
const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

/**
 * Update a user's storage usage when they upload a file
 * @param userId The user's ID
 * @param fileSize The size of the uploaded file in bytes
 * @returns Object with success status and message
 */
export async function updateUserStorageUsage(
  userId: string,
  fileSize: number
): Promise<{ success: boolean; message?: string; storageAvailable?: boolean }> {
  try {
    // First, get the current user data to check storage limit
    const userResult = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.DYNAMODB_USERS_TABLE!,
        Key: { userId },
      })
    );

    const userData = userResult.Item;

    if (!userData) {
      throw new Error("User not found");
    }

    const tier = (userData.tier || "free") as PlanTier;
    const currentStorageUsed = userData.storageUsed || 0;
    const storageLimit = STORAGE_LIMITS[tier];

    // Check if the user has enough storage space left
    if (currentStorageUsed + fileSize > storageLimit) {
      return {
        success: false,
        message:
          "Storage limit exceeded. Please upgrade your plan or free up space.",
        storageAvailable: false,
      };
    }

    // Update the user's storage usage
    await ddbDocClient.send(
      new UpdateCommand({
        TableName: process.env.DYNAMODB_USERS_TABLE!,
        Key: { userId },
        UpdateExpression:
          "SET storageUsed = storageUsed + :increment, updatedAt = :now",
        ExpressionAttributeValues: {
          ":increment": fileSize,
          ":now": new Date().toISOString(),
        },
        ReturnValues: "NONE",
      })
    );

    return { success: true, storageAvailable: true };
  } catch (error) {
    console.error("Error updating user storage:", error);
    return {
      success: false,
      message: "Failed to update storage usage. Please try again.",
      storageAvailable: false,
    };
  }
}

/**
 * Decrease a user's storage usage when they delete a file
 * @param userId The user's ID
 * @param fileSize The size of the deleted file in bytes
 */
export async function decreaseUserStorageUsage(
  userId: string,
  fileSize: number
): Promise<{ success: boolean; message?: string }> {
  try {
    // Update the user's storage usage
    await ddbDocClient.send(
      new UpdateCommand({
        TableName: process.env.DYNAMODB_USERS_TABLE!,
        Key: { userId },
        UpdateExpression:
          "SET storageUsed = storageUsed - :decrement, updatedAt = :now",
        ExpressionAttributeValues: {
          ":decrement": fileSize,
          ":now": new Date().toISOString(),
        },
        // Ensure storageUsed never goes below 0
        ConditionExpression: "storageUsed >= :decrement",
      })
    );

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // If the condition expression fails, still try to set to 0
    if (error.name === "ConditionalCheckFailedException") {
      try {
        await ddbDocClient.send(
          new UpdateCommand({
            TableName: process.env.DYNAMODB_USERS_TABLE!,
            Key: { userId },
            UpdateExpression: "SET storageUsed = :zero, updatedAt = :now",
            ExpressionAttributeValues: {
              ":zero": 0,
              ":now": new Date().toISOString(),
            },
          })
        );
        return { success: true };
      } catch (innerError) {
        console.error("Error setting storage to 0:", innerError);
      }
    }

    console.error("Error decreasing user storage:", error);

    return {
      success: false,
      message: "Failed to update storage usage. Please try again.",
    };
  }
}

/**
 * Get the current storage usage for a user
 * @param userId The user's ID
 * @returns Object with storage used, storage limit, and percentage used
 */
export async function getUserStorageInfo(userId: string): Promise<{
  storageUsed: number;
  storageLimit: number;
  storagePercentage: number;
  tier: PlanTier;
}> {
  try {
    // Get the user data
    const userResult = await ddbDocClient.send(
      new GetCommand({
        TableName: process.env.DYNAMODB_USERS_TABLE!,
        Key: { userId },
      })
    );

    const userData = userResult.Item;

    if (!userData) {
      // Default to free tier values if user not found
      return {
        storageUsed: 0,
        storageLimit: STORAGE_LIMITS.free,
        storagePercentage: 0,
        tier: "free",
      };
    }

    const tier = (userData.tier || "free") as PlanTier;
    const storageUsed = userData.storageUsed || 0;
    const storageLimit = STORAGE_LIMITS[tier];
    const storagePercentage = Math.min(100, (storageUsed / storageLimit) * 100);

    return {
      storageUsed,
      storageLimit,
      storagePercentage,
      tier,
    };
  } catch (error) {
    console.error("Error getting user storage info:", error);
    // Return default values if there's an error
    return {
      storageUsed: 0,
      storageLimit: STORAGE_LIMITS.free,
      storagePercentage: 0,
      tier: "free",
    };
  }
}
