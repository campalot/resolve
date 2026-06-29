import { Link, useNavigate } from "react-router-dom";
import type {
  InteractionActivity,
  InteractionActivityMetadata_Reviewer,
} from "@resolve/types";
import { ActivityCard } from "./ActivityCard";
import { formatRelative } from "../../helpers";
import AddUserIcon from "../../assets/add-user-svgrepo-com.svg?react";
import { useWorkspacePath } from "../../hooks/useWorkspacePath";
import { identityRoute, interactionRoute } from "../../routes/routes";
import Avatar from "../Avatars/Avatar";
import styles from "./ActivityCard.module.scss";

const UserPlusIcon: React.FC = () => {
  return (
    <span>
      <AddUserIcon />
    </span>
  );
};

export function ReviewerAssignedCard({
  activity,
}: {
  activity: InteractionActivity;
}) {
  const workspacePath = useWorkspacePath();
  const navigate = useNavigate();
  const { nextReviewer } =
    activity.metadata as InteractionActivityMetadata_Reviewer;

  return (
    <ActivityCard
      icon={<UserPlusIcon />}
      title="New reviewer assigned"
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
          <Avatar identity={nextReviewer?.identity} size={24} addLink />
        </div>

        {/* Column 2: Name + Action Text */}
        <div className={styles.textContent}>
          <Link
            to={workspacePath(identityRoute(nextReviewer?.identity.id))}
            className={styles.actorName}
          >
            {activity.actor.name}
          </Link>

          {" is next to review"}
        </div>
      </div>
    </ActivityCard>
  );
}
