import SchemaBuilder from '@pothos/core';
import type { 
    Identity, 
    Interaction, 
    Workspace, 
    ToastNotification, 
    ProposalData, 
    ContractData, 
    VendorOnboardingData,
    PolicyUpdateData,
    InteractionActivity,
    InteractionActivityMetadata_Status,
    InteractionActivityMetadata_Reviewer,
    InteractionActivityMetadata_Comment,
    InteractionActivityMetadata_Decision,
    InteractionActivityMetadata_Created,
    InteractionsConnection,
    IdentitiesConnection,
    ActivitiesConnection,
    SearchConnection,
    GraphQLContext
} from '@resolve/types';

const testSchemaBuilder: typeof SchemaBuilder = SchemaBuilder;

// Declare the layout structure explicitly as a standalone type
type PothosConfig = {
  Context: GraphQLContext;
  Objects: {
    Identity: Identity;
    Interaction: Interaction;
    ToastNotification: ToastNotification;

    ProposalData: ProposalData;
    ContractData: ContractData;
    VendorOnboardingData: VendorOnboardingData;
    PolicyUpdateData: PolicyUpdateData;

    InteractionActivity: InteractionActivity;
    InteractionActivityMetadata_Status: InteractionActivityMetadata_Status;
    InteractionActivityMetadata_Reviewer: InteractionActivityMetadata_Reviewer;
    InteractionActivityMetadata_Comment: InteractionActivityMetadata_Comment;
    InteractionActivityMetadata_Decision: InteractionActivityMetadata_Decision;
    InteractionActivityMetadata_Created: InteractionActivityMetadata_Created;
    // Map custom relation sub-shapes too
    InteractionParty: {
      role: string;
      identity: Identity;
    };
    Workspace: Workspace;
    // Tells Pothos that this string corresponds to a generic connection object
    IdentitiesConnection: IdentitiesConnection;
    InteractionsConnection: InteractionsConnection;
    ActivitiesConnection: ActivitiesConnection;
    SearchConnection: SearchConnection;
  };
};


// Enforce that "Identity" strictly maps to the shared TypeScript interface
export const builder = new SchemaBuilder<PothosConfig>({});
