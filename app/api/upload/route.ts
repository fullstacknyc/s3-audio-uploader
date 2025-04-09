import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Verify environment variables
  if (!process.env.AWS_ACCESS_KEY_ID || 
      !process.env.AWS_SECRET_ACCESS_KEY ||
      !process.env.AWS_REGION ||
      !process.env.AWS_BUCKET_NAME) {
    return NextResponse.json(
      { error: "AWS credentials not configured" },
      { status: 500 }
    );
  }

  try {
    const { filename, filetype } = await req.json();
    
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${Date.now()}-${filename}`,
      ContentType: filetype,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return NextResponse.json({ url });

  } catch (error) {
    console.error('S3 Error:', error);
    return NextResponse.json(
      { error: "Failed to generate upload URL", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}