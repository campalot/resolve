import styles from "./Identities.module.scss";
import skeletonStyles from "./IdentitiesSkeleton.module.scss";
import paginationStyles from "../../components/Pagination/Pagination.module.scss";
import { Toolbar } from "../../components/Toolbars/Toolbar";
import { IdentitiesListSkeleton } from "./IdentitiesListSkeleton";

export const IdentitiesSkeleton = () => {
  return (
    <section>
      <h1>People</h1>
      <div className={styles.paginationBar}>
        <nav className={paginationStyles.pagination}>
          <div
            className={`${skeletonStyles.bone} ${skeletonStyles.pagination}`}
          />
        </nav>
      </div>
      <Toolbar>
        <Toolbar.Top>
          <div className={`${skeletonStyles.bone} ${skeletonStyles.search}`} />
          <Toolbar.SortGroup>
            <div className={`${skeletonStyles.bone} ${skeletonStyles.sort}`} />
          </Toolbar.SortGroup>
        </Toolbar.Top>
        <Toolbar.Bottom>
          <div className={`${skeletonStyles.bone} ${skeletonStyles.status}`} />
        </Toolbar.Bottom>
      </Toolbar>
      <IdentitiesListSkeleton />
    </section>
  );
};