import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    const { filename, filetype } = await req.json();
    if (!filename || !filetype) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const s3Key = `uploads/${Date.now()}-${encodeURIComponent(filename)}`;

    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        ContentType: filetype,
      }),
      { expiresIn: 3600 }
    );

    const downloadUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
      }),
      { expiresIn: 604800 }
    );

    return NextResponse.json({ uploadUrl, downloadUrl });
  } catch (error) {
    console.error('S3 Error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}