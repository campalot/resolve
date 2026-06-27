import { DashboardItemSkeleton } from "../Dashboard/DashboardItemSkeleton";
import { InteractionsListSkeleton } from "../Interactions/InteractionsListSkeleton";
import styles from "./Profile.module.scss";
import skeletonStyles from "./ProfileSkeleton.module.scss";

export const ProfileSkeleton = () => {
  return (
    <div className={styles.profileContainer}>
      {/* Header */}
      <div className={styles.profileHeader}>
        <div className={styles.profileHeaderContent}>
          <div className={skeletonStyles.avatar} />
          <div className={skeletonStyles.headerText}>
            <div className={skeletonStyles.name} />
            <div className={skeletonStyles.subline} />
            <div className={skeletonStyles.sublineShort} />
          </div>
        </div>

        <div className={skeletonStyles.statsRow}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`statsrow-${i}`} className={skeletonStyles.statBlock} />
          ))}
        </div>
      </div>

      <div className={styles.profileLayout}>
        {/* Left */}
        <div className={styles.profileBodyLeft}>
          <InteractionsListSkeleton isProfile={true} />
        </div>

        {/* Right */}
        <div className={styles.profileBodyRight}>
          <section style={{ width: "100%" }}>
            <ul
              role="feed"
              style={{
                display: "grid",
                paddingInlineStart: "0",
                gap: "1rem",
                listStyle: "none",
              }}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={`card-${i}`}>
                  <DashboardItemSkeleton />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
