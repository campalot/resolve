import { gql } from "@apollo/client";

export const GET_IDENTITIES = gql`
  query GetIdentities(
  $workspaceId: ID!
  $filters: IdentityFilters
  $sortBy: IdentitySort
  $searchQuery: String
  $offset: Int
  $limit: Int
) {
  identities(
    workspaceId: $workspaceId, 
    filters: $filters, 
    sortBy: $sortBy, 
    searchQuery: $searchQuery,
    offset: $offset, 
    limit: $limit 
  ) {
    results {
      id
      name
      type
      status
      workspaceId
      company {
        id
        name
      }
      avatarUrl
      stats {
        total
        active
        awaiting
        lastActivityAt
      }
    }
    pageInfo {
      total
      hasMore
    }
  }
}
`;
