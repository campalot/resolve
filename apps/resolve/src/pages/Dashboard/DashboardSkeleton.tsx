import styles from "./Dashboard.module.scss";
import { DashboardItemSkeleton } from "./DashboardItemSkeleton";

export const DashboardSkeleton = ({ cards = 5 }) => {
  return (
    <div className={styles.dashboardFeed}>
      <h1>Activity</h1>
      <ul className={styles.dashboardList}>
         {Array.from({ length: cards }).map((_, i) => {
          return (
            <li key={i}>
              <DashboardItemSkeleton />
            </li>
          );
        })}
      </ul>
    </div>
  );
};
