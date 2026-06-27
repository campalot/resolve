import { gql } from "@apollo/client";

export const GET_INTERACTIONS_REFERENCE_DATA = gql`
  query InteractionsReferenceData($workspaceId: String!) {
    parties(workspaceId: $workspaceId) {
      id
      name
      __typename
    }
    interactionStatuses
    interactionTypes
  }
`;
