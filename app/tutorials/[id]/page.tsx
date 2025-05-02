'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FiArrowLeft, FiClock, FiBarChart, FiDownload, FiShare2, FiThumbsUp, FiMessageSquare } from 'react-icons/fi';
import styles from './tutorial-detail.module.css';

type Tutorial = {
    id: string,
    title: string,
    category: string,
    duration: string,
    difficulty: string,
    thumbnail: string,
    description: string,
    videoId: string,
    popular: boolean,
    content: string,
    relatedTutorials: string[]
};
// Tutorial data - In a real app, this would come from a CMS or database
const tutorials: Tutorial[] = [
  {
    id: 'uploading-first-file',
    title: 'Uploading Your First Audio File',
    category: 'getting-started',
    duration: '3:45',
    difficulty: 'Beginner',
    thumbnail: '/tutorials/upload-tutorial.jpg',
    description: 'Learn how to quickly upload and securely store your first audio file with AudioCloud.',
    videoId: 'abc123',
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
    relatedTutorials: ['organizing-files', 'secure-sharing', 'audio-formats'],
  },
  {
    id: 'organizing-files',
    title: 'Organizing Your Audio Library',
    category: 'getting-started',
    duration: '5:20',
    difficulty: 'Beginner',
    thumbnail: '/tutorials/organize-tutorial.jpg',
    description: 'Discover how to create folders, add tags, and keep your audio files neatly organized.',
    videoId: 'def456',
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
    relatedTutorials: ['uploading-first-file', 'metadata-management', 'backup-strategies'],
  },
  {
    id: 'secure-sharing',
    title: 'Secure Sharing with Collaborators',
    category: 'collaboration',
    duration: '4:15',
    difficulty: 'Intermediate',
    thumbnail: '/tutorials/sharing-tutorial.jpg',
    description: 'Learn how to securely share your audio projects with band members, producers, and clients.',
    videoId: 'ghi789',
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
    relatedTutorials: ['collaboration-workflow', 'uploading-first-file', 'version-control'],
  },
  // Additional tutorial content data would go here...
];

export default function TutorialDetailPage() {
  const params = useParams();
  const [tutorial, setTutorial] = useState<Tutorial>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    const tutorialId = params.id as string;
    const foundTutorial = tutorials.find(t => t.id === tutorialId);
    
    if (foundTutorial) {
      setTutorial(foundTutorial);
    }
    
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (!tutorial) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h1>Tutorial Not Found</h1>
          <p>The tutorial you’re looking for doesn’t exist or has been moved.</p>
          <Link href="/tutorials" className={styles.backLink}>
            <FiArrowLeft size={16} />
            Back to Tutorials
          </Link>
        </div>
      </div>
    );
  }

  const relatedTutorialsData = tutorial.relatedTutorials 
    ? tutorials.filter(t => tutorial.relatedTutorials.includes(t.id))
    : [];

  return (
    <div className={styles.container}>
      <Link href="/tutorials" className={styles.backLink}>
        <FiArrowLeft size={16} />
        Back to Tutorials
      </Link>
      
      <div className={styles.tutorialHeader}>
        <div className={styles.categoryBadge}>{tutorial.category.replace('-', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</div>
        <h1>{tutorial.title}</h1>
        <div className={styles.tutorialMeta}>
          <div className={styles.metaItem}>
            <FiClock size={16} />
            <span>{tutorial.duration}</span>
          </div>
          <div className={styles.metaItem}>
            <FiBarChart size={16} />
            <span>{tutorial.difficulty}</span>
          </div>
        </div>
      </div>
      
      <div className={styles.videoContainer}>
        <div className={styles.videoPlaceholder}>
          {/* In a real app, this would be an embedded video player */}
          <div className={styles.playButton}>Play Video</div>
        </div>
      </div>
      
      <div className={styles.contentWrapper}>
        <div className={styles.mainContent}>
          <div className={styles.description}>{tutorial.description}</div>
          
          <div className={styles.actions}>
            <button className={styles.actionButton}>
              <FiDownload size={16} />
              <span>Download</span>
            </button>
            <button className={styles.actionButton}>
              <FiShare2 size={16} />
              <span>Share</span>
            </button>
            <button className={styles.actionButton}>
              <FiThumbsUp size={16} />
              <span>Like</span>
            </button>
          </div>
          
          <div 
            className={styles.tutorialContent}
            dangerouslySetInnerHTML={{ __html: tutorial.content }}
          />
          
          <div className={styles.comments}>
            <h3>
              <FiMessageSquare size={20} />
              <span>Comments</span>
            </h3>
            <div className={styles.commentBox}>
              <textarea placeholder="Leave a comment or question..." />
              <button>Submit</button>
            </div>
            <p className={styles.commentHint}>Comments are only visible to AudioCloud users.</p>
          </div>
        </div>
        
        <div className={styles.sidebar}>
          {relatedTutorialsData.length > 0 && (
            <div className={styles.relatedTutorials}>
              <h3>Related Tutorials</h3>
              <div className={styles.relatedList}>
                {relatedTutorialsData.map(related => (
                  <Link 
                    href={`/tutorials/${related.id}`} 
                    key={related.id}
                    className={styles.relatedItem}
                  >
                    <div className={styles.relatedThumbnail}>
                      {/* Placeholder for thumbnail */}
                    </div>
                    <div className={styles.relatedInfo}>
                      <h4>{related.title}</h4>
                      <span>{related.duration}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          <div className={styles.downloadResources}>
            <h3>Resources</h3>
            <ul>
              <li>
                <a href="#" className={styles.resourceLink}>Tutorial Transcript (PDF)</a>
              </li>
              <li>
                <a href="#" className={styles.resourceLink}>Exercise Files</a>
              </li>
              <li>
                <a href="#" className={styles.resourceLink}>Cheat Sheet</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}