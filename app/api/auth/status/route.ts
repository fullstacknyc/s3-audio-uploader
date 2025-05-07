// app/api/auth/status/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
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

// Check if token is expired
function isTokenExpired(token: string): boolean {
  try {
    // Decode the token without verification (we just want to check the exp)
    const decoded = jose.decodeJwt(token);

    // Check if there's an expiration claim
    if (!decoded.exp) {
      // If there's no exp claim, treat as invalid/expired for safety
      return true;
    }

    // Get current time in seconds (JWT exp is in seconds)
    const currentTime = Math.floor(Date.now() / 1000);

    // Compare expiration time with current time
    // Add a small buffer (10 seconds) to account for network latency
    return decoded.exp <= currentTime + 10;
  } catch (error) {
    console.error("Error decoding token:", error);
    // If we can't decode the token, treat it as expired for safety
    return true;
  }
}

export async function GET() {
  try {
    // Get auth cookie
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    // Check if token is expired before making the API call
    if (isTokenExpired(token)) {
      console.log("Token is expired, clearing cookie");
      cookieStore.delete(COOKIE_NAME);
      return NextResponse.json(
        {
          authenticated: false,
          tokenExpired: true,
        },
        { status: 200 }
      );
    }

    // Verify token with Cognito
    try {
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

      // Get additional user data from DynamoDB
      let userData;
      try {
        const userResult = await ddbDocClient.send(
          new GetCommand({
            TableName: process.env.DYNAMODB_USERS_TABLE!,
            Key: { userId: sub },
          })
        );
        userData = userResult.Item;
      } catch (error) {
        console.error("Error fetching user data from DynamoDB:", error);
        // Continue even if DynamoDB fetch fails
      }

      // Return user info
      return NextResponse.json(
        {
          authenticated: true,
          user: {
            id: sub,
            email,
            name,
            tier: userData?.tier || "free",
          },
        },
        { status: 200 }
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Token verification error:", error);

      // Token is invalid or expired, clear it
      cookieStore.delete(COOKIE_NAME);

      return NextResponse.json({ authenticated: false }, { status: 200 });
    }
  } catch (error) {
    console.error("Auth status error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Failed to verify authentication status" },
      { status: 500 }
    );
  }
}
