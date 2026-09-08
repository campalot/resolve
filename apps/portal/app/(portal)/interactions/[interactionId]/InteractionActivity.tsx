import React from "react";
import type { HTMLAttributes } from "react";
import { useInteractionActivities } from "@/hooks/useInteractionActivities";
import { Box } from "@mui/material";
import { TimelineHeader } from "./TimelineHeader";
import styles from "./InteractionActivity.module.scss";
// import { getActivityIcon } from "../../components/Badges/helpers";
import type {
  InteractionActivity as InteractionActivityType,
  InteractionActivityMetadata_Decision,
} from "@resolve/types";
import IconComment from "@/assets/comment-text-svgrepo-com.svg";
import IconPlus from "@/assets/plus-circle-fill-svgrepo-com.svg";
import IconPerson from "@/assets/person-fill-svgrepo-com.svg";
import IconStatusChange from "@/assets/pending-filled-svgrepo-com.svg";
import IconCheckmark from "@/assets/checkmark-svgrepo-com.svg";
import IconCancel from "@/assets/cancel-svgrepo-com.svg";

function getActivityIcon(activity: InteractionActivityType) {
  switch (activity.type) {
    case "INTERACTION_DECIDED": {
      const status = (activity.metadata as InteractionActivityMetadata_Decision)
        .finalStatus;
      return status === "APPROVED" ? IconCheckmark : IconCancel;
    }

    case "STATUS_CHANGED":
      return IconStatusChange;

    case "COMMENT_ADDED":
      return IconComment;

    case "REVIEWER_ASSIGNED":
      return IconPerson;

    case "INTERACTION_CREATED":
      return IconPlus;

    default:
      return IconStatusChange;
  }
}

export interface ClientActivity extends InteractionActivityType {
  isOptimistic?: boolean;
}

type InteractionActivityProps = {
  interactionId: string;
};

export const InteractionActivity: React.FC<InteractionActivityProps> = ({
  interactionId,
}) => {
  const { results, loading, error } =
      useInteractionActivities({
        filters: {
          interactionId, 
        },
        enabled: true,
      });

  if (error) return <div>Failed to load activities</div>;
  if (loading) {
    return (
      <Box className={styles.timeline}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Box key={i} className={styles.timelineItem}>
            <Box className={styles.timelineIconSkeleton} />
            <Box className={styles.timelineContent}>
              <div className={styles.skeletonHeader} />
              <div className={styles.skeletonBody} />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box className={styles.timeline}>
      {results.map((activity: ClientActivity) => {
        // 1. Handle the Skeleton State
        if (activity.isOptimistic) {
          return (
            <Box key={activity.id} className={styles.timelineItem}>
              {/* Replace with your actual Skeleton component/markup */}
              <Box className={styles.timelineIconSkeleton} />
              <Box className={styles.timelineContent}>
                <div className={styles.skeletonHeader} />
                <div className={styles.skeletonBody} />
              </Box>
            </Box>
          );
        }

        // 2. Handle the Actual Activity State
        const IconComponent: React.FC<HTMLAttributes<SVGElement>> =
          getActivityIcon(activity) || null;

        return (
          <Box key={activity.id} className={styles.timelineItem}>
            {IconComponent && <IconComponent className={styles.timelineIcon} />}
            <Box className={styles.timelineContent}>
              <TimelineHeader activity={activity} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
