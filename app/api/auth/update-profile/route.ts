// app/api/auth/update-profile/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  CognitoIdentityProviderClient,
  UpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import * as jose from "jose";

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

export async function POST(request: Request) {
  try {
    // Get auth cookie
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Parse request body
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }

    // Decode token to get user info
    try {
      // Update user attributes in Cognito
      await cognitoClient.send(
        new UpdateUserAttributesCommand({
          AccessToken: token,
          UserAttributes: [
            {
              Name: "name",
              Value: name,
            },
          ],
        })
      );

      // Get user ID from token
      const payload = jose.decodeJwt(token);
      const userId = payload.sub;

      if (userId) {
        // Update user data in DynamoDB
        await ddbDocClient.send(
          new UpdateCommand({
            TableName: process.env.DYNAMODB_USERS_TABLE!,
            Key: { userId },
            UpdateExpression: "SET #name = :name, updatedAt = :updatedAt",
            ExpressionAttributeNames: {
              "#name": "name",
            },
            ExpressionAttributeValues: {
              ":name": name,
              ":updatedAt": new Date().toISOString(),
            },
          })
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Profile updated successfully",
          user: {
            name,
          },
        },
        { status: 200 }
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Handle specific Cognito errors
      if (error.name === "NotAuthorizedException") {
        // Token is invalid or expired, clear it
        cookieStore.delete(COOKIE_NAME);
        return NextResponse.json(
          { success: false, message: "Session expired. Please log in again." },
          { status: 401 }
        );
      }

      throw error; // Re-throw for general error handling
    }
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update profile. Please try again later.",
      },
      { status: 500 }
    );
  }
}
