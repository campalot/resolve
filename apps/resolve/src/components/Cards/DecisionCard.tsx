import type { HTMLAttributes } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { InteractionActivity } from "../../types/schema";
import type { InteractionActivityMetadata_Decision } from "../../types/schema";
import { ActivityCard } from "./ActivityCard";
import { formatRelative } from "../../helpers";
import { ICON_MAP } from "../Badges/helpers";
import { useWorkspacePath } from "../../hooks/useWorkspacePath";
import { identityRoute, interactionRoute } from "../../routes/routes";
import { capitalize } from "../../helpers";
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

export function DecisionCard({
  activity,
}: {
  activity: InteractionActivity;
}) {
  const workspacePath = useWorkspacePath();
  const navigate = useNavigate();
  const { finalStatus, decisionMaker } =
    activity.metadata as InteractionActivityMetadata_Decision;

  return (
    <ActivityCard
      icon={<StatusIcon status={finalStatus} />}
      title={`Interaction ${capitalize(finalStatus.toLowerCase())}`}
      type={activity.type}
      status={finalStatus}
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
        {finalStatus && (
          <>
            {/* Column 1: Avatar */}
            <div className={styles.avatarPillar}>
              <Avatar identity={decisionMaker} size={24} addLink />
            </div>

            {/* Column 2: Name + Action Text */}
            <div className={styles.textContent}>
              <Link
                to={workspacePath(identityRoute(decisionMaker.id))}
                className={styles.actorName}
              >
                {activity.actor.name}
              </Link>

              {` ${finalStatus.toLowerCase()} this interaction`}
            </div>
          </>
        )}
      </div>
    </ActivityCard>
  );
}
