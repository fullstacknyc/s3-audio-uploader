import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

// Initialize S3 client outside the handler for reuse
if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error('Missing AWS configuration in environment variables');
}

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export async function POST(req: Request) {
  // Environment check with detailed logging
  if (!process.env.AWS_BUCKET_NAME) {
    console.error('S3 Bucket Name missing in environment');
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const { filename, filetype } = await req.json();
    
    if (!filename || !filetype) {
      return NextResponse.json(
        { error: "Filename and filetype are required" },
        { status: 400 }
      );
    }

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${Date.now()}-${filename}`,
      ContentType: filetype,
      // Important for larger files:
      StorageClass: 'STANDARD',
      ACL: 'private', // or 'public-read' if needed
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    
    return NextResponse.json({ url });

  } catch (error) {
    console.error('S3 Upload Error:', error);
    return NextResponse.json(
      { error: "File upload service unavailable" },
      { status: 503 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'edge'; // Optimize for Vercel