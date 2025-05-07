import { NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  AdminConfirmSignUpCommand,
  SignUpCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
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

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { name, email, password } = await request.json();

    // Input validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    // Sign up the user with Cognito
    try {
      // Get client ID and secret from environment variables
      const clientId = process.env.COGNITO_CLIENT_ID!;
      const clientSecret = process.env.COGNITO_CLIENT_SECRET;

      // Create the signup params
      const signUpParams: SignUpCommandInput = {
        ClientId: clientId,
        Username: email,
        Password: password,
        UserAttributes: [
          {
            Name: "name",
            Value: name,
          },
          {
            Name: "email",
            Value: email,
          },
        ],
      };

      // Add SecretHash if client secret is configured
      if (clientSecret) {
        signUpParams.SecretHash = calculateSecretHash(
          email,
          clientId,
          clientSecret
        );
      }

      const signUpResponse = await cognitoClient.send(
        new SignUpCommand(signUpParams)
      );

      // If auto-confirm is enabled for testing purposes (not recommended for production)
      if (
        process.env.NODE_ENV === "development" &&
        process.env.AUTO_CONFIRM_USERS === "true"
      ) {
        await cognitoClient.send(
          new AdminConfirmSignUpCommand({
            UserPoolId: process.env.COGNITO_USER_POOL_ID!,
            Username: email,
          })
        );
      }

      // Store additional user data in DynamoDB
      const userId = signUpResponse.UserSub;
      await ddbDocClient.send(
        new PutCommand({
          TableName: process.env.DYNAMODB_USERS_TABLE!,
          Item: {
            userId,
            email,
            name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tier: "free", // Default tier
            storageUsed: 0,
          },
        })
      );

      return NextResponse.json(
        {
          success: true,
          message:
            "User registered successfully. Please check your email to verify your account.",
          userId,
        },
        { status: 201 }
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Cognito signup error:", error);

      // Handle specific Cognito errors
      if (error.name === "UsernameExistsException") {
        return NextResponse.json(
          {
            success: false,
            message: "An account with this email already exists",
          },
          { status: 409 }
        );
      }

      if (error.name === "InvalidPasswordException") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Password does not meet requirements. It should include uppercase, lowercase, numbers, and special characters.",
          },
          { status: 400 }
        );
      }

      throw error; // Re-throw for general error handling
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to register user. Please try again later.",
      },
      { status: 500 }
    );
  }
}
