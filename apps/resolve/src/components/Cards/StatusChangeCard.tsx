import type { HTMLAttributes } from "react";
import { Link, useNavigate } from "react-router-dom";
import type {
  InteractionActivity,
  InteractionActivityMetadata_Status,
} from "@resolve/types";
import { ActivityCard } from "./ActivityCard";
import StatusBadge from "../Badges/StatusBadge";
import { formatRelative } from "../../helpers";
import { ICON_MAP } from "../Badges/helpers";
import { useWorkspacePath } from "../../hooks/useWorkspacePath";
import { identityRoute, interactionRoute } from "../../routes/routes";
import Avatar from "../Avatars/Avatar";
import styles from "./ActivityCard.module.scss";

type StatusIconProps = {
  status: string;
}

const StatusIcon: React.FC<StatusIconProps> = ({
  status,
}) => {
  const IconComponent: React.FC<HTMLAttributes<SVGElement>> =
    ICON_MAP[status.toUpperCase()] || null;

  return (
    <span>
      <IconComponent />
    </span>
  );
};

export function StatusChangeCard({
  activity,
}: {
  activity: InteractionActivity;
}) {
  const workspacePath = useWorkspacePath();
  const navigate = useNavigate();
  const { previousStatus, newStatus } =
    activity.metadata as InteractionActivityMetadata_Status;

  return (
    <ActivityCard
      icon={<StatusIcon status={newStatus} />}
      title="Status changed"
      type={activity.type}
      timestamp={formatRelative(activity.occurredAt)}
      interactionTitle={activity.interactionTitle}
      interactionId={activity.interactionId}
      onClick={() =>
        navigate(
          workspacePath(interactionRoute(activity.interactionId, "overview")),
        )
      }
    >
      <div className={styles.activityLayout}>
        {/* Column 1: Avatar */}
        <div className={styles.avatarPillar}>
          <Avatar identity={activity.actor} size={24} addLink />
        </div>

        {/* Column 2: Name + Action Text */}
        <div className={styles.textContent}>
          <Link to={workspacePath(identityRoute(activity.actor.id))} className={styles.actorName}>
            {activity.actor.name}
          </Link>

          {" changed the status from "}
          <StatusBadge status={previousStatus} />
          {" to "}
          <StatusBadge status={newStatus} />
        </div>
      </div>
    </ActivityCard>
  );
}
