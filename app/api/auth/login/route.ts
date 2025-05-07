import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import * as jose from "jose";
import { calculateSecretHash } from "@/lib/utils/cognitoUtils";

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
    // Parse the request body
    const { email, password } = await request.json();

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Authenticate with Cognito
    try {
      // Get client ID and secret from environment variables
      const clientId = process.env.COGNITO_CLIENT_ID!;
      const clientSecret = process.env.COGNITO_CLIENT_SECRET;

      // Create auth params
      const authParams: Record<string, string> = {
        USERNAME: email,
        PASSWORD: password,
      };

      // Add SecretHash if client secret is configured
      if (clientSecret) {
        authParams.SECRET_HASH = calculateSecretHash(
          email,
          clientId,
          clientSecret
        );
      }

      const authResponse = await cognitoClient.send(
        new InitiateAuthCommand({
          ClientId: clientId,
          AuthFlow: "USER_PASSWORD_AUTH",
          AuthParameters: authParams,
        })
      );

      // Extract tokens
      const idToken = authResponse.AuthenticationResult?.IdToken;
      const accessToken = authResponse.AuthenticationResult?.AccessToken;
      const refreshToken = authResponse.AuthenticationResult?.RefreshToken;

      if (!idToken || !accessToken || !refreshToken) {
        throw new Error(
          "Authentication succeeded but tokens were not returned"
        );
      }

      // Decode the ID token to get user info
      const payload = jose.decodeJwt(idToken);
      const userId = payload.sub;
      const userName = payload.name;
      const userEmail = payload.email;

      // Get additional user data from DynamoDB
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let userData: any = { tier: "free" }; // Default tier
      try {
        const userResult = await ddbDocClient.send(
          new GetCommand({
            TableName: process.env.DYNAMODB_USERS_TABLE!,
            Key: { userId },
          })
        );
        if (userResult.Item) {
          userData = userResult.Item;
        }
      } catch (error) {
        console.error("Error fetching user data from DynamoDB:", error);
        // Continue even if DynamoDB fetch fails
      }

      // Set auth cookie
      const cookieStore = await cookies();
      cookieStore.set({
        name: COOKIE_NAME,
        value: accessToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: MAX_AGE,
        path: "/",
      });

      // Return success response with user info
      return NextResponse.json(
        {
          success: true,
          authenticated: true,
          user: {
            id: userId,
            name: userName || userData.name,
            email: userEmail || userData.email,
            tier: userData.tier || "free",
          },
          // Don't include tokens in the response for security reasons
          // except for the refresh token which the client might need
          refreshToken,
        },
        { status: 200 }
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Handle specific Cognito errors
      if (error.name === "NotAuthorizedException") {
        return NextResponse.json(
          { success: false, message: "Incorrect email or password" },
          { status: 401 }
        );
      }

      if (error.name === "UserNotConfirmedException") {
        return NextResponse.json(
          {
            success: false,
            message: "Please verify your email before logging in",
            code: "UserNotConfirmedException",
          },
          { status: 400 }
        );
      }

      throw error; // Re-throw for general error handling
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Authentication failed. Please try again later.",
      },
      { status: 500 }
    );
  }
}
