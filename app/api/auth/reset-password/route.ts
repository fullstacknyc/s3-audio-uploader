// app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmForgotPasswordCommandInput,
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
    const { email, code, newPassword } = await request.json();

    // Input validation
    if (!email || !code || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, verification code, and new password are required",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    // Get client ID and secret from environment variables
    const clientId = process.env.COGNITO_CLIENT_ID!;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;

    // Create reset password params
    const params: ConfirmForgotPasswordCommandInput = {
      ClientId: clientId,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    };

    // Add SecretHash if client secret is configured
    if (clientSecret) {
      params.SecretHash = calculateSecretHash(email, clientId, clientSecret);
    }

    // Confirm forgot password in Cognito
    try {
      await cognitoClient.send(new ConfirmForgotPasswordCommand(params));

      return NextResponse.json(
        {
          success: true,
          message:
            "Your password has been reset successfully. You can now log in with your new password.",
        },
        { status: 200 }
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Handle specific Cognito errors
      if (error.name === "CodeMismatchException") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid verification code. Please check your email for the correct code.",
          },
          { status: 400 }
        );
      }

      if (error.name === "ExpiredCodeException") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Verification code has expired. Please request a new code.",
          },
          { status: 400 }
        );
      }

      if (error.name === "UserNotFoundException") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Account not found. Please make sure your email is correct.",
          },
          { status: 404 }
        );
      }

      if (error.name === "InvalidPasswordException") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Password does not meet the requirements. It should include uppercase, lowercase, numbers, and special characters.",
          },
          { status: 400 }
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
    console.error("Reset password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to reset password. Please try again later.",
      },
      { status: 500 }
    );
  }
}
