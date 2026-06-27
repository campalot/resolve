import { gql } from "@apollo/client";
import { INTERACTION_DETAILS } from "../fragments/InteractionDetails";
import { INTERACTION_ACTIVITY_DETAILS } from "../fragments/InteractionActivityDetails";

export const GET_PROFILE = gql`
  query GetProfile(
  $workspaceId: ID!,
  $identityId: ID!
) {
  identity(workspaceId: $workspaceId, id: $identityId) {
    id
    name
    avatarUrl
    company {
      id
      name
    }
  }

  interactions(
    workspaceId: $workspaceId,
    identityId: $identityId
  ) {
    ...InteractionDetails
  }

  activities(
    workspaceId: $workspaceId,
    actorId: $identityId
  ) {
    ...InteractionActivityDetails
  }
}
  ${INTERACTION_DETAILS}
  ${INTERACTION_ACTIVITY_DETAILS}
`;
