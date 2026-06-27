import { gql } from '@apollo/client';

export const INTERACTION_ACTIVITY_DETAILS = gql`
  fragment InteractionActivityDetails on InteractionActivity {
    id
    workspaceId
    interactionId
    interactionTitle
    type
    occurredAt
    actor {
      id
      name
      workspaceId
      type
      status
      country
      createdAt
    }
    metadata {
      ... on InteractionActivityMetadata_Status {
        previousStatus
        newStatus
      }

      ... on InteractionActivityMetadata_Reviewer {
        nextReviewer
      }
      
      ... on InteractionActivityMetadata_Decision {
        decisionMaker
        finalStatus
      }

      ... on InteractionActivityMetadata_Comment {
        commentExcerpt
      }
    }
  }
`;
