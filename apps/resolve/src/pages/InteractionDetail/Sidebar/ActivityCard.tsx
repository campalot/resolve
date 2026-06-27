import React from "react";
import { Box, Typography } from "@mui/material";
import styles from "./SidebarCard.module.scss";

type ActivityCardProps = {
  eventCount: number;
  commentCount: number;
};

export const ActivityCard: React.FC<ActivityCardProps> = ({
  eventCount,
  commentCount,
}) => {
  return (
    <Box className={`${styles.sidebarCard} ${styles.sectionCard}`}>
      <Typography variant="overline" className={styles.sectionLabel}>
        Activity
      </Typography>

      <Typography variant="body2">
        {eventCount} events · {commentCount} comment
        {commentCount !== 1 ? "s" : ""}
      </Typography>
    </Box>
  );
};