import React from "react";
import { Box, Typography } from "@mui/material";
import { MetadataRow } from "../common/MetadataRow";
import styles from "./SidebarCard.module.scss";

type ResponsibilityCardProps = {
  creator: string;
  currentReviewer?: string;
  decisionBy?: string;
};

export const ResponsibilityCard: React.FC<ResponsibilityCardProps> = ({
  creator,
  currentReviewer,
  decisionBy,
}) => {
  return (
    <Box className={`${styles.sidebarCard} ${styles.sectionCard}`}>
      <Typography variant="overline" className={styles.sectionLabel}>
        Responsibility
      </Typography>

      <MetadataRow label="Creator">{creator}</MetadataRow>

      {currentReviewer && (
        <MetadataRow label="Current reviewer">{currentReviewer}</MetadataRow>
      )}

      {decisionBy && (
        <MetadataRow label="Decision by">{decisionBy}</MetadataRow>
      )}
    </Box>
  );
};
