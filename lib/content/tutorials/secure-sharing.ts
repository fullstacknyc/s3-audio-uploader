// lib/content/tutorials/secure-sharing.ts
import { Tutorial } from "./tutorial-types";

const tutorial: Tutorial = {
  id: "secure-sharing",
  title: "Secure Sharing with Collaborators",
  category: "collaboration",
  duration: "4:15",
  difficulty: "Intermediate",
  thumbnail: "/tutorials/sharing-tutorial.jpg",
  description:
    "Learn how to securely share your audio projects with band members, producers, and clients.",
  videoId: "ghi789",
  popular: true,
  content: `
    <h2>Share Your Audio Securely</h2>
    <p>Collaboration is essential in audio production. This guide shows you how to share your files securely with different types of collaborators.</p>
    
    <h3>Types of Sharing Links</h3>
    <p>AudioCloud offers several ways to share your content:</p>
    <ul>
        <li>View-only links: Recipients can listen but not download</li>
        <li>Download links: Recipients can download the file</li>
        <li>Expiring links: Access is removed after a set time period</li>
        <li>Password-protected links: Requires a password to access</li>
    </ul>
    
    <h3>Setting Permission Levels</h3>
    <p>Different collaborators may need different levels of access:</p>
    <ul>
        <li>Listeners: Can only stream the audio</li>
        <li>Commenters: Can add timestamped comments for feedback</li>
        <li>Editors: Can replace the file with new versions</li>
        <li>Administrators: Can manage permissions for other users</li>
    </ul>
    
    <h3>Creating Collaboration Spaces</h3>
    <p>For ongoing projects, create a dedicated collaboration space where all team members can access the files they need and communicate in one place.</p>
  `,
  relatedTutorials: [
    "collaboration-workflow",
    "uploading-first-file",
    "version-control",
  ],
};

export default tutorial;
