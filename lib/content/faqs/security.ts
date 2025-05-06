// lib/content/faqs/security.ts
import { FAQ } from "./faq-types";

const securityFaqs: FAQ[] = [
  {
    id: "security-measures",
    question: "How does AudioCloud keep my files secure?",
    answer:
      "We use industry-standard encryption for all stored files (AES-256), secure transfer protocols (TLS), and regular security audits. Your files are stored redundantly across multiple secure data centers. Pro and Studio plans include additional security features like activity logs and custom access controls.",
    category: "security",
  },
  {
    id: "data-retention",
    question: "How long do you keep my files?",
    answer:
      "As long as your account is active, we retain all your files indefinitely. If you delete a file, it moves to a trash folder for 30 days before permanent deletion. If you cancel a paid subscription, your files remain accessible but you won't be able to upload new content until you reduce your storage below the free tier limit.",
    category: "security",
  },
  {
    id: "copyright-infringement",
    question: "What is your policy on copyright infringement?",
    answer:
      "AudioCloud respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA). We promptly respond to legitimate copyright infringement notices and have a repeat infringer policy. For more details, please see our Terms of Service.",
    category: "security",
  },
  // Add more security FAQs as needed
];

export default securityFaqs;
