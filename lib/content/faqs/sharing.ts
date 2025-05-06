// lib/content/faqs/sharing.ts
import { FAQ } from "./faq-types";

const sharingFaqs: FAQ[] = [
  {
    id: "share-files",
    question: "How do I share my audio files with collaborators?",
    answer:
      "You can create secure share links with various permission levels. Options include view-only (streaming only), download enabled, time-limited links, and password protection. Pro and Studio plans have additional collaboration features like shared workspaces and direct invitations.",
    category: "sharing",
  },
  {
    id: "audio-preview",
    question: "Can listeners preview my audio without downloading it?",
    answer:
      "Yes, AudioCloud includes a built-in audio player for all shared files. Recipients can stream your audio directly in their browser without downloading it. Pro and Studio plans include waveform visualization and enhanced playback controls.",
    category: "sharing",
  },
  // Add more sharing FAQs as needed
];

export default sharingFaqs;
