// lib/content/faqs/faq-types.ts

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface FAQCategory {
  id: string;
  title: string;
  icon: string;
}
