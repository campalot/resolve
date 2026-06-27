import { gql } from "@apollo/client";
import { INTERACTION_DETAILS } from "../fragments/InteractionDetails"

export const GET_SEARCH_RESULTS = gql`
  query GetSearchResults(
    $workspaceId: String!
    $queryString: String!
    $offset: Int!
    $limit: Int!
  ) {
    search(workspaceId: $workspaceId, queryString: $queryString, offset: $offset, limit: $limit) {
      results {
        __typename
        ... on Identity {
          id
          name
          type
          status
        }
        ... on Interaction {
          ...InteractionDetails
        }
      }
      pageInfo {
        hasMore
        total
      }
    }
  }
  ${INTERACTION_DETAILS}
`;

