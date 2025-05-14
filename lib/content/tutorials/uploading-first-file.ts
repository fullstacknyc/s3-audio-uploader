// lib/content/tutorials/uploading-first-file.ts
import { Tutorial } from "./tutorial-types";

const tutorial: Tutorial = {
  id: "uploading-first-file",
  title: "Uploading Your First Audio File",
  category: "getting-started",
  duration: "3:45",
  difficulty: "Beginner",
  thumbnail: "/tutorials/upload-tutorial.jpg",
  description:
    "Learn how to quickly upload and securely store your first audio file with AudioCloud.",
  videoId: "9fpmPPeWjnY",
  popular: true,
  content: `
      <h2>Getting Started with AudioCloud</h2>
      <p>In this tutorial, you'll learn how to upload your first audio file to AudioCloud and start building your secure cloud library.</p>
      
      <h3>What You'll Need</h3>
      <ul>
        <li>An AudioCloud account (Free, Pro, or Studio)</li>
        <li>An audio file in MP3, WAV, AAC, OGG, or FLAC format</li>
        <li>A stable internet connection</li>
      </ul>
      
      <h3>Step 1: Access the Upload Interface</h3>
      <p>Log in to your AudioCloud account and navigate to the main dashboard. You'll see an "Upload" button in the top navigation bar or in the center of your dashboard if you haven't uploaded any files yet.</p>
      
      <h3>Step 2: Select Your File</h3>
      <p>Click the "Upload" button to open the file browser. Navigate to the location of your audio file on your device, select it, and click "Open".</p>
      <p>Alternatively, you can drag and drop your audio file directly onto the upload area.</p>
      
      <h3>Step 3: Add Metadata (Optional)</h3>
      <p>While your file is uploading, you can add metadata to help organize and find your file later. Consider adding:</p>
      <ul>
        <li>Title: A descriptive name for your audio file</li>
        <li>Description: Additional context or notes about the file</li>
        <li>Tags: Keywords to help categorize and search for your file</li>
      </ul>
      
      <h3>Step 4: Choose Privacy Settings</h3>
      <p>AudioCloud lets you set privacy controls for each file. You can choose:</p>
      <ul>
        <li>Private: Only you can access the file</li>
        <li>Shared: Only people with the link can access the file</li>
        <li>Public: Anyone can find and listen to your file (not recommended for sensitive content)</li>
      </ul>
      
      <h3>Step 5: Complete the Upload</h3>
      <p>Once the upload is complete, your file will be securely stored in your AudioCloud library. You'll see a confirmation message with a link to access your file.</p>
      
      <h3>Next Steps</h3>
      <p>Now that you've uploaded your first file, you can:</p>
      <ul>
        <li>Share the file with collaborators or clients</li>
        <li>Organize your files into folders</li>
        <li>Create playlists for related audio files</li>
        <li>Add more files to build your audio library</li>
      </ul>
      
      <h3>Troubleshooting Common Issues</h3>
      <p>If you encounter problems during upload, check these common solutions:</p>
      <ul>
        <li>File too large: Free accounts have a 100MB per file limit. Upgrade to Pro or Studio for larger file uploads.</li>
        <li>Upload fails: Check your internet connection and try again.</li>
        <li>Format not supported: Ensure your file is in a supported format (MP3, WAV, AAC, OGG, or FLAC).</li>
      </ul>
    `,
  relatedTutorials: ["organizing-files", "secure-sharing", "audio-formats"],
};

export default tutorial;
