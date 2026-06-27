import type { InteractionActivity } from "../../types/schema";
import type { InteractionActivityType } from "../../types/schema";
import { StatusChangeCard } from "../../components/Cards/StatusChangeCard";
import { CommentAddedCard } from "../../components/Cards/CommentAddedCard";
import { ReviewerAssignedCard } from "../../components/Cards/ReviewerAssignedCard";
import { DecisionCard } from "../../components/Cards/DecisionCard";
import { InteractionCreatedCard } from "../../components/Cards/InteractionCreatedCard";

export const activityRenderers: Record<
  InteractionActivityType,
  React.FC<{ activity: InteractionActivity }>
> = {
  STATUS_CHANGED: StatusChangeCard,
  REVIEWER_ASSIGNED: ReviewerAssignedCard,
  COMMENT_ADDED: CommentAddedCard,
  INTERACTION_CREATED: InteractionCreatedCard,
  INTERACTION_DECIDED: DecisionCard,
};