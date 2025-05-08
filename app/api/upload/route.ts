// app/api/upload/route.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  FILE_SIZE_LIMITS,
  DOWNLOAD_EXPIRY_TIMES,
  formatBytes,
} from "@/lib/constants/plans";
import type { PlanTier } from "@/lib/constants/plans";
import { getUserStorageInfo } from "@/lib/utils/storageUtils";

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

// Cookie name for auth
const AUTH_COOKIE_NAME = "audiocloud_auth";

// Valid audio file types
const VALID_AUDIO_TYPES = [
  "audio/mpeg", // MP3
  "audio/wav", // WAV
  "audio/x-wav", // Alternative WAV MIME type
  "audio/aac", // AAC
  "audio/x-m4a", // M4A
  "audio/ogg", // OGG
  "audio/flac", // FLAC
  "audio/x-flac", // Alternative FLAC MIME type
  "audio/aiff", // AIFF
  "audio/x-aiff", // Alternative AIFF MIME type
];

// Get the current user's info (tier, ID, etc.)
async function getCurrentUserInfo() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  let userId = null;
  let userTier: PlanTier = "free";

  if (authToken) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/status`,
        {
          method: "GET",
          headers: {
            Cookie: `${AUTH_COOKIE_NAME}=${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (data.authenticated && data.user?.id) {
        userId = data.user.id;
        userTier = data.user.tier || "free";
      }
    } catch (error) {
      console.error("Error verifying auth token:", error);
    }
  }

  return { userId, userTier };
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

    // Get user information
    const { userId, userTier } = await getCurrentUserInfo();

    // Validate file type
    if (!VALID_AUDIO_TYPES.includes(filetype)) {
      return NextResponse.json(
        {
          error: `Unsupported file type. Supported formats: ${VALID_AUDIO_TYPES.map(
            (type) => type.split("/")[1].toUpperCase()
          ).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file size against plan limits
    const fileSizeLimit = FILE_SIZE_LIMITS[userTier];
    if (filesize > fileSizeLimit) {
      return NextResponse.json(
        {
          error: `File size exceeds the ${userTier} plan limit of ${formatBytes(
            fileSizeLimit
          )}. Please upgrade your plan or reduce file size.`,
          upgradePlan: true,
        },
        { status: 400 }
      );
    }

    // For authenticated users, check if they have enough storage space
    if (userId) {
      const storageInfo = await getUserStorageInfo(userId);

      if (storageInfo.storageUsed + filesize > storageInfo.storageLimit) {
        return NextResponse.json(
          {
            error: `Not enough storage space. You have ${formatBytes(
              storageInfo.storageLimit - storageInfo.storageUsed
            )} available. Please upgrade your plan or free up space.`,
            upgradePlan: true,
            storageDetails: {
              used: storageInfo.storageUsed,
              limit: storageInfo.storageLimit,
              available: storageInfo.storageLimit - storageInfo.storageUsed,
              needed: filesize,
            },
          },
          { status: 400 }
        );
      }
    }

    // Generate unique S3 key
    const s3Key = `uploads/${
      userId || "anonymous"
    }/${Date.now()}-${encodeURIComponent(filename)}`;

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

    // Generate presigned download URL with expiry time based on user tier
    const downloadExpiry = DOWNLOAD_EXPIRY_TIMES[userTier];

    const downloadUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        ResponseContentDisposition: `attachment; filename="${encodeURIComponent(
          filename
        )}"`,
      }),
      { expiresIn: downloadExpiry }
    );

    return NextResponse.json({
      uploadUrl,
      downloadUrl,
      userTier,
      storageKey: s3Key,
    });
  } catch (error) {
    console.error("S3 Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
