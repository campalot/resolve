import { gql } from "@apollo/client";
import { INTERACTION_ACTIVITY_DETAILS } from "../fragments/InteractionActivityDetails";

export const GET_INTERACTION_ACTIVITIES = gql`
  query GetInteractionActivities(
  $workspaceId: String!
  $filters: InteractionFilters
  $offset: Int
  $limit: Int
) {
  interactionActivities(workspaceId: $workspaceId, filters: $filters, offset: $offset, limit: $limit) {
    results {
      ...InteractionActivityDetails
      isOptimistic @client
    }
    pageInfo {
      total
      hasMore
      comments
    }
  }
}
  ${INTERACTION_ACTIVITY_DETAILS}
`;