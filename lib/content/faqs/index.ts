// lib/content/faqs/index.ts
import { FAQ, FAQCategory } from "./faq-types";
import generalFaqs from "./general";
import accountFaqs from "./account";
import technicalFaqs from "./technical";
import securityFaqs from "./security";
import sharingFaqs from "./sharing";
import uploadsFaqs from "./uploads";

// Define FAQ categories
export const faqCategories: FAQCategory[] = [
  {
    id: "general",
    title: "General Questions",
    icon: "❓",
  },
  {
    id: "account",
    title: "Account & Billing",
    icon: "💳",
  },
  {
    id: "uploads",
    title: "Uploads & Storage",
    icon: "🔄",
  },
  {
    id: "sharing",
    title: "Sharing & Collaboration",
    icon: "🔗",
  },
  {
    id: "security",
    title: "Security & Privacy",
    icon: "🔒",
  },
  {
    id: "technical",
    title: "Technical Support",
    icon: "🛠️",
  },
];

// Combine all FAQs
const allFaqs: FAQ[] = [
  ...generalFaqs,
  ...accountFaqs,
  ...technicalFaqs,
  ...securityFaqs,
  ...sharingFaqs,
  ...uploadsFaqs,
];

// Function to get all FAQs
export function getAllFaqs(): FAQ[] {
  return allFaqs;
}

// Function to get FAQs by category
export function getFaqsByCategory(category: string): FAQ[] {
  return allFaqs.filter((faq) => faq.category === category);
}

// Function to get a specific FAQ by ID
export function getFaqById(id: string): FAQ | undefined {
  return allFaqs.find((faq) => faq.id === id);
}
