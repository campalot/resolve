import { gql } from "@apollo/client";
import { INTERACTION_DETAILS } from "../fragments/InteractionDetails";

export const GET_INTERACTIONS = gql`
  query GetInteractions(
  $workspaceId: String!
  $filters: InteractionFilters
  $sortBy: InteractionsSort
  $offset: Int
  $limit: Int
) {
  interactions(workspaceId: $workspaceId, filters: $filters, sortBy: $sortBy, offset: $offset, limit: $limit) {
    results {
      ...InteractionDetails
    }
    pageInfo {
      total
      hasMore
    }
  }
}
  ${INTERACTION_DETAILS}
`;
