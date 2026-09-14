import React from "react";
import { Box, Typography } from "@mui/material";
import { StatusBadge } from "@resolve/ui";
import type { InteractionState } from "@resolve/types";
import styles from "./SidebarCard.module.scss";

export const statusColorMap: Record<InteractionState, string> = {
  DRAFT: "#9ca3af",
  IN_REVIEW: "#2563eb",
  APPROVED: "#16a34a",
  REJECTED: "#dc2626",
};

type StageCardProps = {
  status: string;
  label: string;
  description?: string;
  handleAction: (action: string) => void;
  allowedActions: string[];
};

export const StageCard: React.FC<StageCardProps> = ({
  status,
  label,
  description,
}) => {
  return (
    <Box
      className={`${styles.sidebarCard} ${styles.stageCard}`}
      style={{ borderLeftColor: statusColorMap[status] }}
    >
      <Box className={styles.stageHeader} data-testid="interaction-status">
        <StatusBadge status={status} />
      </Box>

      <Typography variant="h6" className={styles.stageTitle}>
        {label}
      </Typography>

      {description && (
        <Typography variant="body2" className={styles.stageDescription}>
          {description}
        </Typography>
      )}
    </Box>
  );
};
