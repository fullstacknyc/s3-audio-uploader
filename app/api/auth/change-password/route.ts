// app/api/auth/change-password/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  CognitoIdentityProviderClient,
  ChangePasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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
    const { currentPassword, newPassword } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password and new password are required",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    // Update password in Cognito
    try {
      await cognitoClient.send(
        new ChangePasswordCommand({
          AccessToken: token,
          PreviousPassword: currentPassword,
          ProposedPassword: newPassword,
        })
      );

      return NextResponse.json(
        {
          success: true,
          message: "Password updated successfully",
        },
        { status: 200 }
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Handle specific Cognito errors
      if (error.name === "NotAuthorizedException") {
        if (error.message?.includes("Incorrect username or password")) {
          return NextResponse.json(
            { success: false, message: "Current password is incorrect" },
            { status: 400 }
          );
        }

        // Other auth errors, session likely expired
        cookieStore.delete(COOKIE_NAME);
        return NextResponse.json(
          { success: false, message: "Session expired. Please log in again." },
          { status: 401 }
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

      throw error; // Re-throw for general error handling
    }
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update password. Please try again later.",
      },
      { status: 500 }
    );
  }
}
