import { gql } from "@apollo/client";

export const GET_INTERACTIONS_BY_IDENTITY = gql`
  query GetInteractionsByIdentity( $workspaceId: ID!, $identityId: ID!) {
    interactionsByIdentity(workspaceId: $workspaceId, identityId: $identityId) {
      ...InteractionDetails
    }
  }
`;
