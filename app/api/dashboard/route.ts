// app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  GetCommand,
  QueryCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
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

// Cookie name
const COOKIE_NAME = "audiocloud_auth";

export async function GET() {
  try {
    // Get auth cookie
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    try {
      // Verify token with Cognito
      const userResponse = await cognitoClient.send(
        new GetUserCommand({
          AccessToken: token,
        })
      );

      // Extract user attributes
      const userAttributes = userResponse.UserAttributes || [];
      const email = userAttributes.find((attr) => attr.Name === "email")?.Value;
      const name = userAttributes.find((attr) => attr.Name === "name")?.Value;
      const sub = userAttributes.find((attr) => attr.Name === "sub")?.Value;

      if (!sub) {
        throw new Error("User ID not found in token");
      }

      // Get user data from DynamoDB
      const userResult = await ddbDocClient.send(
        new GetCommand({
          TableName: process.env.DYNAMODB_USERS_TABLE!,
          Key: { userId: sub },
        })
      );

      const userData = userResult.Item || {
        tier: "free",
        storageUsed: 0,
      };

      // Calculate storage limits based on tier
      const storageLimits = {
        free: 5 * 1024 * 1024 * 1024, // 5GB in bytes
        pro: 100 * 1024 * 1024 * 1024, // 100GB in bytes
        studio: 1024 * 1024 * 1024 * 1024, // 1TB in bytes
      };

      const tier = userData.tier || "free";
      const storageLimit = storageLimits[tier as keyof typeof storageLimits];
      const storageUsed = userData.storageUsed || 0;
      const storagePercentage = (storageUsed / storageLimit) * 100;

      // Get user's files from the shortlinks table
      const filesResult = await ddbDocClient.send(
        new QueryCommand({
          TableName: process.env.DYNAMODB_SHORTLINKS_TABLE!,
          IndexName: "UserIdIndex", // Assuming we have a GSI on userId
          KeyConditionExpression: "userId = :userId",
          ExpressionAttributeValues: {
            ":userId": sub,
          },
          Limit: 10, // Limit to 10 most recent files
          ScanIndexForward: false, // Sort in descending order (most recent first)
        })
      );

      const recentFiles = filesResult.Items || [];

      // Return dashboard data
      return NextResponse.json({
        authenticated: true,
        user: {
          id: sub,
          email,
          name,
          tier,
        },
        storage: {
          used: storageUsed,
          limit: storageLimit,
          percentage: storagePercentage,
        },
        recentFiles: recentFiles.map((file) => ({
          id: file.id,
          shortCode: file.shortCode,
          fileName: file.fileName,
          fileType: file.fileType,
          fileSize: file.fileSize,
          createdAt: file.createdAt,
          downloadCount: file.downloadCount || 0,
        })),
      });
    } catch (error) {
      console.error("Token verification error:", error);

      // Token is invalid or expired, clear it
      cookieStore.delete(COOKIE_NAME);

      return NextResponse.json(
        { authenticated: false, message: "Invalid or expired session" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve dashboard data" },
      { status: 500 }
    );
  }
}
