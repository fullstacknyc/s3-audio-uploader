// lib/content/faqs/technical.ts
import { FAQ } from "./faq-types";

const technicalFaqs: FAQ[] = [
  {
    id: "supported-browsers",
    question: "Which browsers are supported?",
    answer:
      "AudioCloud works with all modern browsers including Chrome, Firefox, Safari, and Edge (latest versions). For the best experience, we recommend using Chrome or Firefox. Internet Explorer is not supported.",
    category: "technical",
  },
  {
    id: "mobile-access",
    question: "Can I access AudioCloud on mobile devices?",
    answer:
      "Yes, our website is fully responsive and works on smartphones and tablets. Pro and Studio subscribers also have access to our dedicated mobile apps for iOS and Android, which include offline listening and enhanced mobile features.",
    category: "technical",
  },
  {
    id: "offline-access",
    question: "Can I access my files offline?",
    answer:
      "Pro and Studio subscribers can mark files for offline access in our mobile apps. These files will be available even without an internet connection. On desktop, you'll need to download files for offline access.",
    category: "technical",
  },
  // Add more technical FAQs as needed
];

export default technicalFaqs;
