import React from "react";
import { Box, Typography } from "@mui/material";
import { MetadataRow } from "../common/MetadataRow";
import styles from "./SidebarCard.module.scss";

type LifecycleCardProps = {
  createdAt: string;
  updatedAt: string;
};

export const LifecycleCard: React.FC<LifecycleCardProps> = ({
  createdAt,
  updatedAt,
}) => {
  return (
    <Box className={`${styles.sidebarCard} ${styles.sectionCard}`}>
      <Typography variant="overline" className={styles.sectionLabel}>
        Lifecycle
      </Typography>

      <MetadataRow label="Created">{createdAt}</MetadataRow>
      <MetadataRow label="Last Updated">{updatedAt}</MetadataRow>
    </Box>
  );
};
