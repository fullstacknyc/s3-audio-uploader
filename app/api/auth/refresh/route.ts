// app/api/auth/refresh/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import * as jose from "jose";
import { calculateSecretHash } from "@/lib/utils/cognitoUtils";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

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

// Cookie settings
const COOKIE_NAME = "audiocloud_auth";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: Request) {
  try {
    // Get the refresh token from the request body
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "Refresh token is required" },
        { status: 400 }
      );
    }

    // Get client ID and secret from environment variables
    const clientId = process.env.COGNITO_CLIENT_ID!;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;

    // Create auth params
    const authParams: Record<string, string> = {
      REFRESH_TOKEN: refreshToken,
    };

    // Add SecretHash if client secret is configured
    if (clientSecret) {
      // For refresh token flow, the username is still required for the secret hash
      // We can extract it from the existing auth cookie if available
      const cookieStore = await cookies();
      const token = cookieStore.get(COOKIE_NAME)?.value;

      let username = "";
      if (token) {
        try {
          const payload = jose.decodeJwt(token);
          username =
            (payload.email as string) || (payload.username as string) || "";
        } catch (error) {
          console.error("Failed to decode JWT for username:", error);
        }
      }

      if (username) {
        authParams.SECRET_HASH = calculateSecretHash(
          username,
          clientId,
          clientSecret
        );
      }
    }

    // Refresh the token with Cognito
    const authResponse = await cognitoClient.send(
      new InitiateAuthCommand({
        ClientId: clientId,
        AuthFlow: "REFRESH_TOKEN_AUTH",
        AuthParameters: authParams,
      })
    );

    // Extract new tokens
    const idToken = authResponse.AuthenticationResult?.IdToken;
    const accessToken = authResponse.AuthenticationResult?.AccessToken;

    if (!idToken || !accessToken) {
      throw new Error("Failed to refresh tokens");
    }

    // Decode the ID token to get user info
    const payload = jose.decodeJwt(idToken);
    const userId = payload.sub;
    const userName = payload.name;
    const userEmail = payload.email;

    // Set the new auth cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: COOKIE_NAME,
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: MAX_AGE,
      path: "/",
    });

    // Get additional user data from DynamoDB
    let userData;
    try {
      const userResult = await ddbDocClient.send(
        new GetCommand({
          TableName: process.env.DYNAMODB_USERS_TABLE!,
          Key: { userId: userId },
        })
      );
      userData = userResult.Item;
    } catch (error) {
      console.error("Error fetching user data from DynamoDB:", error);
      // Continue even if DynamoDB fetch fails
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: userId,
          name: userName,
          email: userEmail,
          tier: userData?.tier || "free",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to refresh token" },
      { status: 500 }
    );
  }
}
