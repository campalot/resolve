import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { StatusBadge } from "@resolve/ui";
import Button from "../../../components/Buttons/Button";
import { ButtonType } from "../../../components/Buttons/Button";
import type { ButtonVariant } from "../../../components/Buttons/Button";
import type { InteractionAction, InteractionState } from "@resolve/types";
import type { Role } from "../../../api/cache";
import styles from "./SidebarCard.module.scss";

const statusColorMap: Record<InteractionState, string> = {
  DRAFT: "#9ca3af",
  IN_REVIEW: "#2563eb",
  APPROVED: "#16a34a",
  REJECTED: "#dc2626",
};

const actionButtonMap: Record<InteractionAction, ButtonVariant> = {
  SUBMIT: ButtonType.Primary,
  RESUBMIT: ButtonType.Primary,
  APPROVE: ButtonType.Primary,
  REJECT: ButtonType.Destructive,
};

type StageCardProps = {
  status: string;
  label: string;
  description?: string;
  handleAction: (action: string) => void;
  allowedActions: string[];
  role: Role;
};

export const StageCard: React.FC<StageCardProps> = ({
  status,
  label,
  description,
  handleAction,
  allowedActions,
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

      {allowedActions.length > 0 && (
        <Box className={styles.actions}>
          <Typography variant="caption" className={styles.actionLabel}>
            Actions
          </Typography>
          <Stack spacing={3} direction="row" className={styles.actionRow}>
            {allowedActions.map((action) => (
              <Button
                key={action}
                buttonType={actionButtonMap[action]}
                onClick={() => handleAction(action)}
              >
                {action}
              </Button>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};
