import React, { ReactNode } from "react";
import Link from "next/link";
import { StatusBadgeAdapter } from "@/components/StatusBadgeAdapter";
import { DashboardInteraction } from "@resolve/types";
import listStyles from "./Interactions.module.scss";
import { IdentifierBadge } from "@resolve/ui";
import { statusColorMap } from "../../interactions/[interactionId]/Sidebar/StageCard";
import type { StatusChangeObj } from "@resolve/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { StatusBadge } from "@resolve/ui";
import { StatusBadgeSize } from "@resolve/ui";

// Activate the plugin
dayjs.extend(relativeTime);

interface InteractionCardProps {
  interaction: DashboardInteraction;
}

const InteractionCard: React.FC<InteractionCardProps> = ({
  interaction,
}) => {
  const { id, title, status, relationship, latestActivity, updatedAt } = interaction;

  function renderLatestEvent(val: string | StatusChangeObj): string | ReactNode {
    if (
      val !== null &&
      typeof val === "object" &&
      val.type === "STATUS_CHANGED"
    ) {
      return (
        <>
          {val.actorName} moved this interaction to{" "}
          <StatusBadge
            status={val.newStatus}
            size={StatusBadgeSize.Small}
            hideIcon
          />
        </>
      ); // It is an object with type "STATUS_CHANGED"
    }

    return val as string;
  }

  const lastActivity = renderLatestEvent(latestActivity);
  const relativeUpdatedAt = dayjs(updatedAt).fromNow();

  return (
    <li
      className={listStyles.card}
      data-testid="interaction-card"
      style={{ borderLeftColor: statusColorMap[status] }}
    >
      <Link
        href={`/interactions/${interaction.id}`}
        className={listStyles.cardLink}
      >
        <div className={listStyles.main}>
          <div className={listStyles.role}>{relationship}</div>
          <div className={listStyles.title}>{title}</div>
          <div className={listStyles.meta}>
            <StatusBadgeAdapter status={status} size={StatusBadgeSize.Small} />{" "}
            · <IdentifierBadge text={id} size={`small`} />
          </div>
          <div className={listStyles.latestActivity}>
            <div className={listStyles.smallLabel}>
              Latest Activity{/*activityCount*/}
            </div>
            <div className={`last-update__description`}>{lastActivity}</div>
          </div>
          <div className={listStyles.timestamp}>
            Updated: {relativeUpdatedAt}
          </div>
        </div>
      </Link>
    </li>
  );
};

export { InteractionCard };
