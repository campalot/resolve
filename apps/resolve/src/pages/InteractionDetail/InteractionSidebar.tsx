import React from "react";
import type { Interaction } from "@resolve/types";
import styles from "./InteractionSidebar.module.scss";
import { Box } from "@mui/material";
import { StageCard } from "./Sidebar/StageCard";
import { ResponsibilityCard } from "./Sidebar/ResponsibilityCard";
import { ParticipantsCard } from "./Sidebar/ParticipantsCard";
import { LifecycleCard } from "./Sidebar/LifecycleCard";
import { ActivityCard } from "./Sidebar/ActivityCard";
import { buildInteractionMetadata } from "./buildInteractionMetadata";
import { useInteractionActivities } from "../../hooks/useInteractionActivities";
import type { Role } from "../../api/cache";

type InteractionSidebarProps = {
  interaction: Interaction;
  handleAction: (action: string) => void;
  allowedActions: string[];
  role: Role;
};

export const InteractionSidebar: React.FC<InteractionSidebarProps> = ({
  interaction,
  handleAction,
  allowedActions,
  role,
}) => {
  const { total, comments } = useInteractionActivities({
    filters: {
      interactionId: interaction.id,
    },
  });

  const metadata = buildInteractionMetadata(interaction, total, comments);

  return (
    <Box className={styles.interactionSidebar}>
      {/* Stage */}
      <StageCard
        status={metadata.stage.status}
        label={metadata.stage.label}
        description={metadata.stage.description}
        handleAction={handleAction}
        allowedActions={allowedActions}
        role={role}
      />

      {/* Responsibility */}
      <ResponsibilityCard
        creator={metadata.responsibility.creator}
        currentReviewer={metadata.responsibility.currentReviewer}
        decisionBy={metadata.responsibility.decisionBy}
      />

      {/* Participants */}
      <ParticipantsCard participants={metadata.participants} />

      {/* Activity */}
      <ActivityCard
        eventCount={metadata.activity.eventCount}
        commentCount={metadata.activity.commentCount}
      />

      {/* Lifecycle */}
      <LifecycleCard
        createdAt={metadata.lifecycle.createdAt}
        updatedAt={metadata.lifecycle.updatedAt}
      />
    </Box>
  );
};


