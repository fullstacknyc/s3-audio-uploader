import { NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  ResendConfirmationCodeCommand,
  ResendConfirmationCodeCommandInput,
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

    // Create command parameters
    const params: ResendConfirmationCodeCommandInput = {
      ClientId: clientId,
      Username: email,
    };

    // If client secret is configured, add SECRET_HASH parameter
    if (clientSecret) {
      const secretHash = calculateSecretHash(email, clientId, clientSecret);
      params.SecretHash = secretHash;
    }

    // Resend confirmation code with Cognito
    try {
      await cognitoClient.send(new ResendConfirmationCodeCommand(params));

      return NextResponse.json(
        {
          success: true,
          message: "Verification code resent successfully",
        },
        { status: 200 }
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Cognito resend code error:", error);

      // Handle specific Cognito errors
      if (error.name === "UserNotFoundException") {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
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
    console.error("Resend code error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to resend verification code. Please try again later.",
      },
      { status: 500 }
    );
  }
}
