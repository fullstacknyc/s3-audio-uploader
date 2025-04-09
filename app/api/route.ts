import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

// Configure AWS S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    // Get filename and filetype from the request
    const { filename, filetype } = await request.json();

    // Set up S3 upload command
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${Date.now()}-${filename}`,  // Unique filename
      ContentType: filetype,  // e.g., "audio/mpeg"
    });

    // Generate a pre-signed URL (expires in 1 hour)
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    // Return the URL to the frontend
    return NextResponse.json({ url });
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}