// lib/content/tutorials/organizing-files.ts
import { Tutorial } from "./tutorial-types";

const tutorial: Tutorial = {
  id: "organizing-files",
  title: "Organizing Your Audio Library",
  category: "getting-started",
  duration: "5:20",
  difficulty: "Beginner",
  thumbnail: "/tutorials/organize-tutorial.jpg",
  description:
    "Discover how to create folders, add tags, and keep your audio files neatly organized.",
  videoId: "def456",
  popular: true,
  content: `
    <h2>Keep Your Audio Files Organized</h2>
    <p>A well-organized audio library helps you find the files you need quickly. This tutorial will show you how to create a logical structure for your growing collection.</p>
    
    <h3>Creating Folders</h3>
    <p>Start by creating a folder structure that makes sense for your workflow. You might organize by:</p>
    <ul>
        <li>Project name</li>
        <li>Client name</li>
        <li>Audio type (samples, masters, works in progress)</li>
        <li>Date recorded</li>
    </ul>
    
    <h3>Using Tags Effectively</h3>
    <p>Tags add another dimension to organization, allowing you to find files across different folders. Consider tagging files with:</p>
    <ul>
        <li>Instrument types</li>
        <li>Tempo/BPM</li>
        <li>Key signature</li>
        <li>Mood or style</li>
        <li>Recording quality</li>
    </ul>
    
    <h3>Smart Playlists</h3>
    <p>Use AudioCloud's smart playlist feature to automatically group files based on criteria you set. For example, create a playlist of all guitar samples or all tracks in C minor.</p>
  `,
  relatedTutorials: [
    "uploading-first-file",
    "metadata-management",
    "backup-strategies",
  ],
};

export default tutorial;
