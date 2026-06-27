import { gql } from "@apollo/client";
import { INTERACTION_DETAILS } from "../fragments/InteractionDetails"

export const GET_INTERACTION = gql`
  query GetInteraction($workspaceId: ID!, $interactionId: ID!) {
    interaction(workspaceId: $workspaceId, id: $interactionId) {
      ...InteractionDetails
      description
      permittedActions
      data
    }
  }
  ${INTERACTION_DETAILS}
`;

