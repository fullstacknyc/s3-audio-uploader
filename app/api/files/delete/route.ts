// app/api/files/delete/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  QueryCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { decreaseUserStorageUsage } from "@/lib/utils/storageUtils";

// Initialize S3 client
const s3 = new S3Client({
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

// Cookie name for auth
const AUTH_COOKIE_NAME = "audiocloud_auth";

export async function POST(request: Request) {
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

    // Parse request body
    const { shortCode } = await request.json();

    if (!shortCode) {
      return NextResponse.json(
        { success: false, message: "Missing shortCode parameter" },
        { status: 400 }
      );
    }

    // Get current user ID from auth status
    const authResponse = await fetch(
      `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/status`,
      {
        method: "GET",
        headers: {
          Cookie: `${AUTH_COOKIE_NAME}=${token}`,
        },
      }
    );

    const authData = await authResponse.json();
    if (!authData.authenticated || !authData.user?.id) {
      return NextResponse.json(
        { success: false, message: "Invalid user session" },
        { status: 401 }
      );
    }

    const userId = authData.user.id;

    // Get the file details from shortlinks table using a query on the ShortCodeIndex
    const shortlinkQuery = await ddbDocClient.send(
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

    if (!shortlinkQuery.Items || shortlinkQuery.Items.length === 0) {
      return NextResponse.json(
        { success: false, message: "File not found" },
        { status: 404 }
      );
    }

    const shortlink = shortlinkQuery.Items[0];
    if (!shortlink) {
      return NextResponse.json(
        { success: false, message: "File not found" },
        { status: 404 }
      );
    }

    // Verify that the file belongs to the current user
    if (shortlink.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to delete this file",
        },
        { status: 403 }
      );
    }

    // Delete file from S3 if storageKey is available
    if (shortlink.storageKey) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: shortlink.storageKey,
          })
        );
      } catch (s3Error) {
        console.error("Error deleting file from S3:", s3Error);
        // Continue with shortlink deletion even if S3 deletion fails
      }
    }

    // Delete shortlink from DynamoDB
    await ddbDocClient.send(
      new DeleteCommand({
        TableName: process.env.DYNAMODB_SHORTLINKS_TABLE!,
        Key: { id: shortlink.id },
      })
    );

    // Update user's storage usage
    await decreaseUserStorageUsage(userId, shortlink.fileSize);

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("File deletion error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete file. Please try again later.",
      },
      { status: 500 }
    );
  }
}
