// lib/content/faqs/uploads.ts
import { FAQ } from "./faq-types";

const uploadsFaqs: FAQ[] = [
  {
    id: "format-support",
    question: "What audio formats does AudioCloud support?",
    answer:
      "AudioCloud supports all major audio formats including WAV, MP3, FLAC, AIFF, AAC, OGG, and more. Our Pro and Studio plans support lossless formats with no compression or quality degradation.",
    category: "uploads",
  },
  {
    id: "file-size",
    question: "Is there a limit to file size?",
    answer:
      "Free accounts have a 100MB per file limit. Pro accounts can upload files up to 1GB, and Studio accounts can upload files up to 10GB. These limits ensure optimal performance for all users.",
    category: "uploads",
  },
  {
    id: "download-all",
    question: "Can I download all my files at once?",
    answer:
      'Yes. In your library view, you can select multiple files or use the "Select All" option, then click the Download button. For large libraries, we offer a bulk export feature that creates a compressed archive of your files for download.',
    category: "uploads",
  },
  // Add more uploads FAQs as needed
];

export default uploadsFaqs;
