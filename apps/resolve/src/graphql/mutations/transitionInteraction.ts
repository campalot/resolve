import { gql } from "@apollo/client";
import { INTERACTION_DETAILS } from "../fragments/InteractionDetails";
import { INTERACTION_ACTIVITY_DETAILS } from "../fragments/InteractionActivityDetails";

export const TRANSITION_INTERACTION = gql`
  mutation TransitionInteraction(
    $id: ID!
    $action: InteractionAction!
    $actorId: ID!
    $workspaceId: ID!
    $comment: String
  ) {
    transitionInteraction(
      id: $id
      action: $action
      actorId: $actorId
      workspaceId: $workspaceId
      comment: $comment
    ) {
      ...InteractionDetails
      notifications {   
        __typename  
        message
        type
      }
      activities {
        __typename
        ...InteractionActivityDetails
        isOptimistic @client
      }
    }
  }
   ${INTERACTION_DETAILS}
   ${INTERACTION_ACTIVITY_DETAILS}
`;
