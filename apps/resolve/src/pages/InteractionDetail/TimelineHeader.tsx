import React from "react";
import type { ReactNode } from "react";
import { StatusBadgeSize } from "../../components/Badges/helpers";
import styles from "./InteractionActivity.module.scss";
import type {
  InteractionActivity,
  InteractionActivityMetadata_Decision,
  InteractionActivityMetadata_Comment,
  InteractionActivityMetadata_Reviewer,
  InteractionActivityMetadata_Status,
  InteractionActivityType,
} from "@resolve/types";
import { Typography } from "@mui/material";
import StatusBadge from "../../components/Badges/StatusBadge";

const activityTemplates: Record<
  InteractionActivityType,
  (activity: InteractionActivity) => string | ReactNode
> = {
  INTERACTION_CREATED: (a) => `${a.actor.name} created this interaction`,

  STATUS_CHANGED: (a) => {
    const meta = a.metadata as InteractionActivityMetadata_Status;
    return (
      <>
        {a.actor.name} moved this interaction to{" "}
        <StatusBadge status={meta.newStatus} size={StatusBadgeSize.Small} />
      </>
    );
  },

  REVIEWER_ASSIGNED: (a) => {
    const meta = a.metadata as InteractionActivityMetadata_Reviewer;
    return `${meta.nextReviewer.identity.name} was assigned as reviewer`;
  },

  COMMENT_ADDED: (a) => `${a.actor.name} commented`,

  INTERACTION_DECIDED: (a) => {
    const meta = a.metadata as InteractionActivityMetadata_Decision;
    return `${a.actor.name} ${meta.finalStatus.toLowerCase()} this interaction`;
  },
};

type TimelineHeaderProps = {
  activity: InteractionActivity;
};

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({ activity }) => {
  const timestamp = new Date(activity.occurredAt).toLocaleString();

  const getTitle = () => activityTemplates[activity.type]?.(activity) ?? null;

  return (
    <>
      <Typography variant="body1" className={styles.timelinePrimary}>
        {getTitle()}
      </Typography>

      {activity.type === "COMMENT_ADDED" && (
        <Typography className={styles.timelineComment}>
          “
          {
            (activity.metadata as InteractionActivityMetadata_Comment)
              .commentExcerpt
          }
          ”
        </Typography>
      )}

      <Typography variant="caption" className={styles.timelineTimestamp}>
        {timestamp}
      </Typography>
    </>
  );
};
