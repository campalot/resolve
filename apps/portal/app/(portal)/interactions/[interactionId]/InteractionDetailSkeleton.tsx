import { Box } from "@mui/material";
import styles from "./InteractionDetail.module.scss";
import skeletonStyles from "./InteractionDetailSkeleton.module.scss";

export const InteractionDetailSkeleton = () => {
  return (
    <Box className={styles.interactionDetail}>
      {/* Header */}
      <Box className={styles.interactionDetailHeader}>
        <Box className={skeletonStyles.headerWrapper}>
          <div className={skeletonStyles.title} />
          <div className={skeletonStyles.subtitle} />
        </Box>
      </Box>

      <Box className={styles.interactionDetailBody}>
        {/* Main */}
        <Box className={styles.interactionDetailMain}>
          {/* Tabs */}
          <div className={skeletonStyles.tabs}>
            <div className={skeletonStyles.tab} />
            <div className={skeletonStyles.tab} />
          </div>

          {/* Content */}
          <div className={skeletonStyles.card} />
          <div className={skeletonStyles.card} />
        </Box>

        {/* Sidebar */}
        <Box className={styles.interactionDetailSidebar}>
          <div className={skeletonStyles.sidebarCardLarge} />
          <div className={skeletonStyles.sidebarCard} />
          <div className={skeletonStyles.sidebarCard} />
        </Box>
      </Box>
    </Box>
  );
};
