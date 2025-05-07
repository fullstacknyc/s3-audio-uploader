// app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  ForgotPasswordCommand,
  ForgotPasswordCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { calculateSecretHash } from "@/lib/utils/cognitoUtils";

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { email } = await request.json();

    // Input validation
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Get client ID and secret from environment variables
    const clientId = process.env.COGNITO_CLIENT_ID!;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;

    // Create forgot password params
    const params: ForgotPasswordCommandInput = {
      ClientId: clientId,
      Username: email,
    };

    // Add SecretHash if client secret is configured
    if (clientSecret) {
      params.SecretHash = calculateSecretHash(email, clientId, clientSecret);
    }

    // Send forgot password request to Cognito
    try {
      await cognitoClient.send(new ForgotPasswordCommand(params));

      return NextResponse.json(
        {
          success: true,
          message:
            "Verification code sent to your email. Please check your inbox for an email with the subject 'Verification Code'.",
        },
        { status: 200 }
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Handle specific Cognito errors
      if (error.name === "UserNotFoundException") {
        // For security reasons, don't reveal that the user doesn't exist
        // Instead, pretend that we sent the reset instructions anyway
        return NextResponse.json(
          {
            success: true,
            message:
              "If an account exists with this email, a verification code has been sent. Please check your inbox.",
          },
          { status: 200 }
        );
      }

      if (error.name === "LimitExceededException") {
        return NextResponse.json(
          {
            success: false,
            message: "Too many attempts. Please try again later.",
          },
          { status: 429 }
        );
      }

      throw error; // Re-throw for general error handling
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process your request. Please try again later.",
      },
      { status: 500 }
    );
  }
}
