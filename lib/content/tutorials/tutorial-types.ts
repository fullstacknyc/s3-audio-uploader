// lib/content/tutorials/tutorial-types.ts

export interface Tutorial {
  id: string;
  title: string;
  category: string;
  duration: string;
  difficulty: string;
  thumbnail: string;
  description: string;
  videoId?: string;
  popular: boolean;
  content: string;
  relatedTutorials: string[];
}

export interface TutorialCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export type TutorialWithoutContent = Omit<Tutorial, "content">;
