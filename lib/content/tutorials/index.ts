// lib/content/tutorials/index.ts
import {
  Tutorial,
  TutorialCategory,
  TutorialWithoutContent,
} from "./tutorial-types";

// Import all tutorials
import uploadingFirstFile from "./uploading-first-file";
import organizingFiles from "./organizing-files";
import secureSharing from "./secure-sharing";
// Import more tutorials as needed

// Define tutorial categories
export const tutorialCategories: TutorialCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description:
      "Learn the basics of AudioCloud and how to get up and running quickly.",
    icon: "FiVideo",
  },
  {
    id: "advanced-features",
    title: "Advanced Features",
    description:
      "Dive deeper into AudioCloud's powerful features for audio professionals.",
    icon: "FiVideo",
  },
  {
    id: "collaboration",
    title: "Collaboration Tools",
    description:
      "Learn how to share and collaborate on audio projects with team members.",
    icon: "FiVideo",
  },
  {
    id: "guides",
    title: "Written Guides",
    description: "Step-by-step guides for specific workflows and techniques.",
    icon: "FiFileText",
  },
];

// Create an array of all tutorials
const tutorials: Tutorial[] = [
  uploadingFirstFile,
  organizingFiles,
  secureSharing,
  // Add more tutorials as they're imported
];

// Function to get all tutorials without content
export function getAllTutorials(): TutorialWithoutContent[] {
  return tutorials.map(
    ({ content, ...tutorialWithoutContent }) => tutorialWithoutContent
  );
}

// Function to get all popular tutorials
export function getPopularTutorials(): TutorialWithoutContent[] {
  return getAllTutorials().filter((tutorial) => tutorial.popular);
}

// Function to get tutorials by category
export function getTutorialsByCategory(
  category: string
): TutorialWithoutContent[] {
  return getAllTutorials().filter((tutorial) => tutorial.category === category);
}

// Function to get a specific tutorial by ID
export function getTutorialById(id: string): Tutorial | undefined {
  return tutorials.find((tutorial) => tutorial.id === id);
}

// Function to get all tutorial IDs (for static paths generation)
export function getAllTutorialIds(): string[] {
  return tutorials.map((tutorial) => tutorial.id);
}
