// app/tutorials/[id]/page.tsx
import Link from "next/link";
import {
  FiArrowLeft,
  FiClock,
  FiBarChart,
  FiDownload,
  FiShare2,
  FiThumbsUp,
  FiMessageSquare,
} from "react-icons/fi";
import styles from "./tutorial-detail.module.css";
import { getTutorialById, getAllTutorialIds } from "@/lib/content/tutorials";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Static page with revalidation
export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

// Generate static paths for all tutorials
export async function generateStaticParams() {
  const ids = getAllTutorialIds();

  return ids.map((id) => ({
    id,
  }));
}

// Generate metadata for each tutorial
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = await params;
  const tutorial = getTutorialById(id);

  if (!tutorial) {
    return {
      title: "Tutorial Not Found - AudioCloud",
      description: "The requested tutorial could not be found.",
    };
  }

  return {
    title: `${tutorial.title} - AudioCloud Tutorials`,
    description: tutorial.description,
    openGraph: {
      title: tutorial.title,
      description: tutorial.description,
      type: "article",
    },
  };
}

export default async function TutorialDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const tutorial = getTutorialById(id);

  // If tutorial not found, show 404 page
  if (!tutorial) {
    notFound();
  }

  // Get related tutorials
  const relatedTutorials = tutorial.relatedTutorials
    .map((id) => getTutorialById(id))
    .filter((t): t is NonNullable<typeof t> => t !== undefined);

  return (
    <div className={styles.container}>
      <Link href="/tutorials" className={styles.backLink}>
        <FiArrowLeft size={16} />
        Back to Tutorials
      </Link>

      <div className={styles.tutorialHeader}>
        <div className={styles.categoryBadge}>
          {tutorial.category
            .replace("-", " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())}
        </div>
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
            <p className={styles.commentHint}>
              Comments are only visible to AudioCloud users.
            </p>
          </div>
        </div>

        <div className={styles.sidebar}>
          {relatedTutorials.length > 0 && (
            <div className={styles.relatedTutorials}>
              <h3>Related Tutorials</h3>
              <div className={styles.relatedList}>
                {relatedTutorials.map((related) => (
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
                <a href="#" className={styles.resourceLink}>
                  Tutorial Transcript (PDF)
                </a>
              </li>
              <li>
                <a href="#" className={styles.resourceLink}>
                  Exercise Files
                </a>
              </li>
              <li>
                <a href="#" className={styles.resourceLink}>
                  Cheat Sheet
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
