import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AudioCloud - Secure Audio Storage",
  description: "Upload and store your audio files securely in the cloud with AudioCloud.",
  openGraph: {
    title: "AudioCloud - Secure Audio Storage",
    description: "Upload and store your audio files securely in the cloud with AudioCloud.",
    url: "https://s3-audio-uploader.vercel.app/",
    siteName: "AudioCloud",
    images: [
      {
        url: "https://yourdomain.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "s3-audio-uploader",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AudioCloud - Secure Audio Storage",
    description: "Upload and store your audio files securely in the cloud with AudioCloud.",
    images: ["https://x.com/pipboy3k"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV === "production" && (
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2330891452848767"
          crossOrigin="anonymous"></script>
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
