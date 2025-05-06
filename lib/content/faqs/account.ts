// lib/content/faqs/account.ts
import { FAQ } from "./faq-types";

const accountFaqs: FAQ[] = [
  {
    id: "cancel-subscription",
    question: "How do I cancel my subscription?",
    answer:
      'You can cancel your subscription at any time from your Account Settings. Navigate to Billing > Subscription and click "Cancel Subscription." Your account will remain active until the end of your current billing period, after which it will revert to a free account. Note that if your storage exceeds the free limit, you\'ll need to remove files to upload new content.',
    category: "account",
  },
  {
    id: "payment-methods",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and Apple Pay. For Studio plans with annual billing, we also offer invoicing options for businesses.",
    category: "account",
  },
  {
    id: "band-discounts",
    question: "Do you offer discounts for bands or music schools?",
    answer:
      "Yes, we offer special pricing for bands, music schools, and production studios. Contact our sales team at sales@audiocloud.com for details on our group rates and educational discounts.",
    category: "account",
  },
  // Add more account FAQs as needed
];

export default accountFaqs;
