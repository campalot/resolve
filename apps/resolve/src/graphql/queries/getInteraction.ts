import { gql } from "@apollo/client";
import { INTERACTION_DETAILS } from "../fragments/InteractionDetails"

export const GET_INTERACTION = gql`
  query GetInteraction($workspaceId: ID!, $interactionId: ID!) {
    interaction(workspaceId: $workspaceId, id: $interactionId) {
      ...InteractionDetails
      description
      permittedActions
      data {
        ... on ContractData {
           summary
           contractValue
           termLengthMonths
           autoRenew
        }
        ... on ProposalData {
           summary
           amount
           currency
           effectiveDate
           expirationDate
        }
        ... on PolicyUpdateData {
           summary
           policyArea
           effectiveDate
           impactLevel
        }
         ... on VendorOnboardingData {
           summary
           vendorType
           riskLevel
           onboardingChecklistComplete
        }
      }
    }
  }
  ${INTERACTION_DETAILS}
`;
