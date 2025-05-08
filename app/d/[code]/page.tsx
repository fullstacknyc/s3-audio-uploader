// app/d/[code]/page.tsx
import { Metadata } from "next";
import DownloadPageClient from "./DownloadPageClient";
import { formatBytes } from "@/lib/utils/formatUtils";

// This file is using Next.js App Router, so we can use the built-in metadata API
// to provide proper titles and descriptions for better sharing experiences

interface ShortlinkData {
  shortCode: string;
  originalUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  expiresAt?: string;
}

// Generate metadata for the download page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  // Get base URL from environment or default to production URL
  const baseUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    "https://s3-audio-uploader.vercel.app";

  // Set the metadata base
  const metadataBase = new URL(baseUrl);

  const { code } = await params;

  try {
    // Fetch file data server-side for better SEO
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_FRONTEND_URL || ""}/api/shortlink/${code}`,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );

    if (!res.ok) {
      return {
        metadataBase,
        title: "File Not Found | AudioCloud",
        description:
          "The file you are looking for could not be found or has expired.",
        openGraph: {
          images: ["/og-image.png"], // Default sharing image
        },
        twitter: {
          card: "summary_large_image",
          images: ["/twitter-card.png"],
        },
      };
    }

    const data = (await res.json()) as ShortlinkData;

    // Construct metadata based on the file
    return {
      metadataBase,
      title: `Download ${data.fileName} | AudioCloud`,
      description: `Download ${data.fileName} (${formatBytes(
        data.fileSize
      )}) securely shared via AudioCloud.`,
      openGraph: {
        title: `Download ${data.fileName} | AudioCloud`,
        description: `Download ${data.fileName} (${formatBytes(
          data.fileSize
        )}) securely shared via AudioCloud.`,
        type: "website",
        siteName: "AudioCloud",
        images: ["/og-image.png"],
      },
      twitter: {
        card: "summary",
        title: `Download ${data.fileName} | AudioCloud`,
        description: `Download ${data.fileName} (${formatBytes(
          data.fileSize
        )}) securely shared via AudioCloud.`,
        images: ["/twitter-card.png"],
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Fallback metadata if there's an error
    return {
      metadataBase,
      title: "Download File | AudioCloud",
      description: "Download audio files securely shared via AudioCloud.",
      openGraph: {
        images: ["/og-image.png"],
      },
      twitter: {
        card: "summary_large_image",
        images: ["/twitter-card.png"],
      },
    };
  }
}

// Dynamic opt-out of static generation for download pages
export const dynamic = "force-dynamic";

// Server-side layout component
export default async function DownloadPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  // Client-side implementation of the file download page
  return <DownloadPageClient code={code} />;
}
