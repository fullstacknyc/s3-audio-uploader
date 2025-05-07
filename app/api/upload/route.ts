import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1", // Fallback to 'us-east-1' if AWS_REGION is not set
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Validate AWS_REGION
if (!process.env.AWS_REGION) {
  console.warn('AWS_REGION is not set. Defaulting to "us-east-1".');
}

export async function POST(req: Request) {
  try {
    const { filename, filetype, filesize } = await req.json();

    // Validate input
    if (!filename || !filetype || !filesize) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate file size
    if (filesize > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 100MB limit" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/aac",
      "audio/x-m4a",
      "audio/ogg",
    ];
    if (!validTypes.includes(filetype)) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    // Generate unique S3 key
    const s3Key = `uploads/${Date.now()}-${encodeURIComponent(filename)}`;

    // Generate presigned upload URL (1 hour expiry)
    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        ContentType: filetype,
      }),
      { expiresIn: 3600 }
    );

    // Generate presigned download URL (7 day expiry)
    const downloadUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        ResponseContentDisposition: `attachment; filename="${encodeURIComponent(
          filename
        )}"`,
      }),
      { expiresIn: 604800 } // Change to 1 Day
    );

    return NextResponse.json({ uploadUrl, downloadUrl });
  } catch (error) {
    console.error("S3 Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
