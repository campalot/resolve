import { useNavigate } from "react-router-dom";
import type {
  InteractionActivity,
  InteractionActivityMetadata_Comment,
} from "@resolve/types";
import { ActivityCard } from "./ActivityCard";
import { formatRelative } from "../../helpers";
import styles from "./CommentAddedCard.module.scss";
import CommentTextIcon from "../../assets/comment-text-svgrepo-com.svg?react";
import IdentityBadge from "../Badges/IdentityBadge";
import { useWorkspacePath } from "../../hooks/useWorkspacePath";
import { interactionRoute } from "../../routes/routes";

const MessageSquareIcon: React.FC = () => {
  return (
    <span>
      <CommentTextIcon />
    </span>
  );
};

export function CommentAddedCard({
  activity,
}: {
  activity: InteractionActivity;
}) {
  const workspacePath = useWorkspacePath();
  const navigate = useNavigate();
  const { commentExcerpt } = activity.metadata as InteractionActivityMetadata_Comment;

  return (
    <ActivityCard
      icon={<MessageSquareIcon />}
      title="New comment"
      type={activity.type}
      timestamp={formatRelative(activity.occurredAt)}
      interactionTitle={activity.interactionTitle}
      interactionId={activity.interactionId}
      onClick={() =>
        navigate(
          workspacePath(interactionRoute(activity.interactionId, `activity`)),
        )
      }
    >
      <div className={styles.activityComment}>
        <div className={styles.commenter}>
          <IdentityBadge identity={activity.actor} size={"sm"} /> commented:
        </div>
        <blockquote className={styles.commentExcerpt}>
          <span className={styles.quotationMarks}>&ldquo;</span>
          {commentExcerpt}
          <span className={styles.quotationMarks}>&rdquo;</span>
        </blockquote>
      </div>
    </ActivityCard>
  );
}
