// lib/content/faqs/general.ts
import { FAQ } from "./faq-types";

const generalFaqs: FAQ[] = [
  {
    id: "what-is-audiocloud",
    question: "What is AudioCloud?",
    answer:
      "AudioCloud is a secure cloud storage service specifically designed for musicians, producers, and audio professionals. We provide specialized features for storing, organizing, and sharing audio files while maintaining their original quality.",
    category: "general",
  },
  {
    id: "free-vs-paid",
    question: "What's the difference between free and paid plans?",
    answer:
      "Our free plan includes 5GB of storage, basic file organization, and support for common audio formats. Paid plans (Pro and Studio) offer additional storage (100GB-1TB), advanced features like version control, wider format support, collaboration tools, priority support, and more. You can compare plans in detail on our Pricing page.",
    category: "general",
  },
  // Add more general FAQs as needed
];

export default generalFaqs;
