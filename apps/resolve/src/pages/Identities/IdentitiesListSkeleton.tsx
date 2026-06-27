import styles from "./Identities.module.scss";
import skeletonStyles from "./IdentitiesSkeleton.module.scss";
import cardStyles from "../../components/Cards/PersonCard.module.scss";

export const IdentitiesListSkeleton = ({ count = 12 }) => {
  return (
    <ul className={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className={cardStyles.personCard}>
          {/* Mimic the PersonCard's internal layout */}
          <div className={cardStyles.cardLink}>
            <div className={cardStyles.personCardHeader}>
              <div className={skeletonStyles.avatarCircle} />
              <div>
                <div className={skeletonStyles.nameLine} />
                <div className={skeletonStyles.subLine} />
              </div>
            </div>
            <div className={cardStyles.personCardStats}>
              <div className={skeletonStyles.stats} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};