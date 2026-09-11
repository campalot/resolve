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

// Vercel's TypeScript build resolves @pothos/core's declaration chain
// differently from the local workspace build and loses the constructor
// signature. Preserve Pothos's generic instance typing explicitly at this
// boundary rather than weakening the builder to `any`.

// 1. Extend the user config type to satisfy the heavy internal properties like outputShapes/inputShapes
type ExtendedSchemaTypes<T extends Partial<PothosSchemaTypes.UserSchemaTypes>> = PothosSchemaTypes.ExtendDefaultTypes<T>;

// 2. Fetch the true instance footprint out of the global namespace safely using the extended type map
type ActualSchemaBuilderInstance<T extends Partial<PothosSchemaTypes.UserSchemaTypes>> = PothosSchemaTypes.SchemaBuilder<ExtendedSchemaTypes<T>>;

// 3. Define the blueprint of the class constructor
type ConstructableSchemaBuilder = new <Types extends Partial<PothosSchemaTypes.UserSchemaTypes> = {}>(
  ...args: any[]
) => ActualSchemaBuilderInstance<Types>;

// 4. Safe type tunnel interceptor
const SafeSchemaBuilder = (SchemaBuilder as unknown) as ConstructableSchemaBuilder;

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
export const builder = new SafeSchemaBuilder<PothosConfig>({});
