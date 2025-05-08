// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import DOMPurify from "isomorphic-dompurify";

// Define a type for the contact form data
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  turnstileToken: string;
}

// Turnstile verification response
interface TurnstileVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  error_codes?: string[];
  action?: string;
  cdata?: string;
}

// Rate limiting variables - in production use Redis or a similar solution
const rateLimit = 5; // max requests per IP in timeWindow
const timeWindow = 60 * 60 * 1000; // 1 hour in milliseconds
const ipRequests: Record<string, number[]> = {};

// Initialize AWS SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Email configuration
const EMAIL_TO = process.env.CONTACT_EMAIL || "your-email@example.com";
const EMAIL_FROM = process.env.SES_FROM_EMAIL || "noreply@yourdomain.com";

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    // Check rate limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Parse request body with error handling
    let formData: ContactFormData;
    try {
      formData = await request.json();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (
      !formData.name ||
      !formData.email ||
      !formData.message ||
      !formData.turnstileToken
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      name: DOMPurify.sanitize(formData.name).trim().slice(0, 100),
      email: DOMPurify.sanitize(formData.email).trim().slice(0, 100),
      subject: DOMPurify.sanitize(formData.subject || "Contact Form Submission")
        .trim()
        .slice(0, 200),
      message: DOMPurify.sanitize(formData.message).trim().slice(0, 1000),
      turnstileToken: formData.turnstileToken,
    };

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(sanitizedData.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Verify Turnstile token
    const turnstileResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: sanitizedData.turnstileToken,
          remoteip: ip, // Optional, but helps with verification accuracy
        }),
      }
    );

    const turnstileResult: TurnstileVerifyResponse =
      await turnstileResponse.json();

    if (!turnstileResult.success) {
      return NextResponse.json(
        {
          error: "Verification failed",
          details: turnstileResult.error_codes || "Unknown error",
        },
        { status: 400 }
      );
    }

    // Construct email content
    const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">New Contact Form Submission</h2>
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-top: 20px;">
        <p><strong>Name:</strong> ${sanitizedData.name}</p>
        <p><strong>Email:</strong> ${sanitizedData.email}</p>
        <p><strong>Subject:</strong> ${sanitizedData.subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 10px;">
          ${sanitizedData.message.replace(/\n/g, "<br>")}
        </div>
      </div>
      <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">This message was sent from the contact form on your website.</p>
    </div>
    `;

    const textBody = `
Name: ${sanitizedData.name}
Email: ${sanitizedData.email}
Subject: ${sanitizedData.subject}

Message:
${sanitizedData.message}

This message was sent from the contact form on your website.
    `;

    // Prepare SES email parameters
    const emailParams = {
      Destination: {
        ToAddresses: [EMAIL_TO],
      },
      ReplyToAddresses: [sanitizedData.email],
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: htmlBody,
          },
          Text: {
            Charset: "UTF-8",
            Data: textBody,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: `Contact Form: ${sanitizedData.subject}`,
        },
      },
      Source: EMAIL_FROM,
    };

    // Send the email using AWS SES
    const command = new SendEmailCommand(emailParams);
    await sesClient.send(command);

    // Track this request for rate limiting
    trackRequest(ip);

    // Return success response
    return NextResponse.json({
      success: true,
      message:
        "Your message has been sent successfully. We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);

    return NextResponse.json(
      {
        error: "Failed to send message. Please try again later.",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

// Simple rate limiting function
function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Initialize or clean old requests
  if (!ipRequests[ip]) {
    ipRequests[ip] = [];
  } else {
    ipRequests[ip] = ipRequests[ip].filter((time) => now - time < timeWindow);
  }

  // Check if rate limit exceeded
  return ipRequests[ip].length >= rateLimit;
}

// Track request for rate limiting
function trackRequest(ip: string): void {
  if (!ipRequests[ip]) {
    ipRequests[ip] = [];
  }

  ipRequests[ip].push(Date.now());
}
