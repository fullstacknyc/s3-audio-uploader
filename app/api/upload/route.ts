import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
  throw new Error("Missing AWS configuration in environment variables");
}

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req: Request) {
  try {
    const { filename, filetype } = await req.json();
    const s3Key = `uploads/${Date.now()}-${filename}`;

    // 1. Generate upload URL
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      ContentType: filetype,
    });
    const uploadUrl = await getSignedUrl(s3, uploadCommand, { expiresIn: 3600 });

    // 2. Pre-generate download URL (valid for 7 days)
    const downloadCommand = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    });
    const downloadUrl = await getSignedUrl(s3, downloadCommand, { expiresIn: 604800 });

    return NextResponse.json({ 
      uploadUrl, 
      downloadUrl,
      s3Key // For reference
    });

  } catch (error) {
    console.error('S3 Error:', error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}