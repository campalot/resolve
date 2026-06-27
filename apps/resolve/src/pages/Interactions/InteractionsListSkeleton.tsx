import styles from "./Interactions.module.scss"; // Use your existing CSS
import skeletonStyles from "./InteractionsSkeleton.module.scss"; // New shimmer styles

export const InteractionsListSkeleton = ({ rows = 10, isProfile = false }) => {
  return (
    <ul className={styles.list}>
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className={styles.row}>
          <div className={styles.rowLink} style={{ cursor: "default" }}>
            <div className={styles.main}>
              <div className={styles.titleRow}>
                {/* Title Skeleton */}
                <div className={skeletonStyles.title} />
                {/* Badge Skeleton */}
                <div className={skeletonStyles.badge} />
              </div>
              {!isProfile && (
                <div className={styles.meta}>
                  {/* Meta text line */}
                  <div className={skeletonStyles.textLine} />
                </div>
              )}
            </div>

            <div className={styles.side}>
              {/* Status Badge Skeleton */}
              <div className={skeletonStyles.status} />
              {!isProfile && (
                <>
                  {/* Date Skeleton */}
                  <div className={skeletonStyles.date} />
                </>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};
