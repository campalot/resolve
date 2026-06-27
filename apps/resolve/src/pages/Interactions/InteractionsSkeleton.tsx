import styles from "./Interactions.module.scss"; // Use your existing CSS
import skeletonStyles from "./InteractionsSkeleton.module.scss"; // New shimmer styles
import paginationStyles from "../../components/Pagination/Pagination.module.scss";
import { Toolbar } from "../../components/Toolbars/Toolbar";
import { InteractionsListSkeleton } from "./InteractionsListSkeleton";

export const InteractionsSkeleton = () => {
  return (
    <section>
      <h1>Interactions</h1>
      <div className={styles.paginationBar}>
        <nav className={paginationStyles.pagination}>
          <div className={skeletonStyles.pagination} />
        </nav>
      </div>
      <Toolbar>
        <Toolbar.Top>
          <div className={skeletonStyles.search} />
          <Toolbar.SortGroup>
            <div className={skeletonStyles.sort} />
          </Toolbar.SortGroup>
        </Toolbar.Top>
        <Toolbar.Bottom>
          <div className={skeletonStyles.status} />
          <div className={skeletonStyles.dateRange} />
        </Toolbar.Bottom>
      </Toolbar>
      <InteractionsListSkeleton />
    </section>
  );
};
