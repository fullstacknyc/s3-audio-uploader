import { NextResponse } from "next/server";
import emailjs from "@emailjs/nodejs";

// Initialize EmailJS with environment variables
emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY || "",
  privateKey: process.env.EMAILJS_PRIVATE_KEY || "",
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { name, email, subject, message, recaptchaToken } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Please fill out all required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA token
    if (!recaptchaToken) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed" },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA token with Google
    const recaptchaVerification = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY || "",
          response: recaptchaToken,
        }).toString(),
      }
    );

    const recaptchaResult = await recaptchaVerification.json();

    if (!recaptchaResult.success) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed" },
        { status: 400 }
      );
    }

    // Prepare email template parameters
    const templateParams = {
      from_name: name,
      from_email: email,
      subject: subject || "Contact Form Submission",
      message: message,
    };

    // Send email using EmailJS
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID || "",
      process.env.EMAILJS_TEMPLATE_ID || "",
      templateParams
    );

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Email sent successfully!",
    });
  } catch (error) {
    console.error("Contact form submission error:", error);

    // Return error response
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
