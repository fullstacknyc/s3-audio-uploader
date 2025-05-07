import { NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  ConfirmSignUpCommandInput,
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
    const { email, code } = await request.json();

    // Input validation
    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "Email and verification code are required" },
        { status: 400 }
      );
    }

    // Get client ID and secret from environment variables
    const clientId = process.env.COGNITO_CLIENT_ID!;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;

    // Create command parameters
    const params: ConfirmSignUpCommandInput = {
      ClientId: clientId,
      Username: email,
      ConfirmationCode: code,
    };

    // If client secret is configured, add SECRET_HASH parameter
    if (clientSecret) {
      const secretHash = calculateSecretHash(email, clientId, clientSecret);
      params.SecretHash = secretHash;
    }

    // Confirm signup with Cognito
    try {
      await cognitoClient.send(new ConfirmSignUpCommand(params));

      return NextResponse.json(
        {
          success: true,
          message: "Email verified successfully",
        },
        { status: 200 }
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Cognito confirmation error:", error);

      // Handle specific Cognito errors
      if (error.name === "CodeMismatchException") {
        return NextResponse.json(
          { success: false, message: "Invalid verification code" },
          { status: 400 }
        );
      }

      if (error.name === "ExpiredCodeException") {
        return NextResponse.json(
          {
            success: false,
            message: "Verification code has expired. Please request a new one.",
          },
          { status: 400 }
        );
      }

      if (error.name === "UserNotFoundException") {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      throw error; // Re-throw for general error handling
    }
  } catch (error) {
    console.error("Confirmation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify email. Please try again later.",
      },
      { status: 500 }
    );
  }
}
