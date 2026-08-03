import { gql } from '@apollo/client';

export const INTERACTION_DETAILS = gql`
  fragment InteractionDetails on Interaction {
    id
    workspaceId
    title
    parties {
      role
      identity {
        id
        name
        type
      }
    }
    type
    status
    currentReviewer {
      id
      name
    }
    creator {
      id
      name
    }
    createdAt
    updatedAt
    __typename
  }
`;