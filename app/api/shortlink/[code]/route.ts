// app/api/shortlink/[code]/route.ts
import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  QueryCommand,
  UpdateCommand,
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json(
        { error: "Shortlink code is required" },
        { status: 400 }
      );
    }

    // Query the shortlink by code
    const queryResult = await ddbDocClient.send(
      new QueryCommand({
        TableName: process.env.DYNAMODB_SHORTLINKS_TABLE!,
        IndexName: "ShortCodeIndex",
        KeyConditionExpression: "shortCode = :shortCode",
        ExpressionAttributeValues: {
          ":shortCode": code,
        },
        Limit: 1,
      })
    );

    if (!queryResult.Items || queryResult.Items.length === 0) {
      return NextResponse.json(
        { error: "Shortlink not found" },
        { status: 404 }
      );
    }

    const shortlink = queryResult.Items[0];

    // Check if link has expired
    if (shortlink.expiresAt && new Date(shortlink.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This link has expired" },
        { status: 410 }
      );
    }

    // Increment the download count
    await ddbDocClient.send(
      new UpdateCommand({
        TableName: process.env.DYNAMODB_SHORTLINKS_TABLE!,
        Key: {
          id: shortlink.id,
        },
        UpdateExpression: "SET downloadCount = downloadCount + :inc",
        ExpressionAttributeValues: {
          ":inc": 1,
        },
      })
    );

    // Return the shortlink data (excluding sensitive info)
    return NextResponse.json({
      shortCode: shortlink.shortCode,
      originalUrl: shortlink.originalUrl,
      fileName: shortlink.fileName,
      fileType: shortlink.fileType,
      fileSize: shortlink.fileSize,
      createdAt: shortlink.createdAt,
      expiresAt: shortlink.expiresAt,
    });
  } catch (error) {
    console.error("Error retrieving shortlink:", error);
    return NextResponse.json(
      { error: "Failed to retrieve shortlink" },
      { status: 500 }
    );
  }
}
