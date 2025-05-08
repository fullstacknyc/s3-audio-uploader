// app/api/shortlink/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  QueryCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { type CreateShortlinkData } from "@/lib/models/Shortlink";
import { FILE_SIZE_LIMITS, type PlanTier } from "@/lib/constants/plans";
import { formatBytes } from "@/lib/utils/formatUtils";
import { updateUserStorageUsage } from "@/lib/utils/storageUtils";
import { generateShortCode } from "@/lib/utils/shortlinkUtils";

// Initialize DynamoDB client
const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Cookie name for auth
const AUTH_COOKIE_NAME = "audiocloud_auth";

// Generate a unique anonymous user ID if not already present
async function getOrCreateAnonymousId(): Promise<string> {
  const cookieStore = await cookies();
  const anonId = cookieStore.get("audiocloud_anon_id");

  if (anonId?.value) {
    return anonId.value;
  }

  // Generate a new anonymous ID
  const newAnonId = `anon_${uuidv4()}`;

  // Set the cookie (30 days expiry)
  cookieStore.set({
    name: "audiocloud_anon_id",
    value: newAnonId,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 30,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  return newAnonId;
}

// Get the current user ID (authenticated or anonymous)
async function getCurrentUserId(): Promise<{
  userId: string;
  isAnonymous: boolean;
  tier: PlanTier;
}> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  // Check if user is authenticated
  if (authToken) {
    try {
      // Get user info from auth status endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/status`,
        {
          method: "GET",
          headers: {
            Cookie: `${AUTH_COOKIE_NAME}=${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (data.authenticated && data.user?.id) {
        return {
          userId: data.user.id,
          isAnonymous: false,
          tier: data.user.tier || "free",
        };
      }
    } catch (error) {
      console.error("Error verifying auth token:", error);
      // Continue with anonymous flow
    }
  }

  // Get or create anonymous ID if not authenticated
  const anonId = await getOrCreateAnonymousId();
  return { userId: anonId, isAnonymous: true, tier: "free" };
}

// Create a new shortlink
export async function POST(request: Request) {
  try {
    // Parse request body
    const data: CreateShortlinkData = await request.json();

    // Validate required fields
    if (
      !data.originalUrl ||
      !data.fileName ||
      !data.fileType ||
      !data.fileSize
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user ID (authenticated or anonymous)
    const { userId, isAnonymous, tier } = await getCurrentUserId();

    // Check file size against plan limits
    const fileSizeLimit = FILE_SIZE_LIMITS[tier];
    if (data.fileSize > fileSizeLimit) {
      return NextResponse.json(
        {
          error: `File size exceeds the ${tier} plan limit of ${formatBytes(
            fileSizeLimit
          )}. Please upgrade your plan or reduce file size.`,
          upgradePlan: true,
        },
        { status: 400 }
      );
    }

    // For authenticated users, update storage usage
    if (!isAnonymous) {
      try {
        const storageResult = await updateUserStorageUsage(
          userId,
          data.fileSize
        );
        if (!storageResult.success) {
          return NextResponse.json(
            {
              error:
                storageResult.message ||
                "Storage limit exceeded. Please upgrade your plan.",
              upgradePlan: true,
            },
            { status: 400 }
          );
        }
      } catch (storageError) {
        console.error(
          "Shortlink API: Error calling updateUserStorageUsage:",
          storageError
        );
        throw storageError; // Re-throw to be caught by outer try/catch
      }
    }

    // Generate short code
    let shortCode = generateShortCode();
    let isUnique = false;

    // Ensure shortcode is unique
    while (!isUnique) {
      // Check if shortcode already exists
      const existingQuery = await ddbDocClient.send(
        new QueryCommand({
          TableName: process.env.DYNAMODB_SHORTLINKS_TABLE!,
          IndexName: "ShortCodeIndex",
          KeyConditionExpression: "shortCode = :shortCode",
          ExpressionAttributeValues: {
            ":shortCode": shortCode,
          },
          Limit: 1,
        })
      );

      if (!existingQuery.Items || existingQuery.Items.length === 0) {
        isUnique = true;
      } else {
        // Generate a new code if this one exists
        shortCode = generateShortCode();
      }
    }

    // Create current timestamp
    const now = new Date().toISOString();

    // Calculate expiry (default: 30 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create shortlink record
    const shortlink = {
      id: uuidv4(),
      shortCode,
      originalUrl: data.originalUrl,
      fileName: data.fileName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      userId,
      isAnonymous,
      createdAt: now,
      expiresAt: expiresAt.toISOString(),
      downloadCount: 0,
      storageKey: data.storageKey || null, // Save storage key for S3 file deletion
    };

    // Save to DynamoDB
    await ddbDocClient.send(
      new PutCommand({
        TableName: process.env.DYNAMODB_SHORTLINKS_TABLE!,
        Item: shortlink,
      })
    );

    // Construct the short URL
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "";
    const shortUrl = `${baseUrl}/d/${shortCode}`;

    // Return the shortlink data
    return NextResponse.json(
      {
        shortCode,
        shortUrl,
        originalUrl: data.originalUrl,
        fileName: data.fileName,
        expiresAt: expiresAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating shortlink:", error);
    return NextResponse.json(
      {
        error: "Failed to create shortlink",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
