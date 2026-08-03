import { builder } from './builder';
import { interactionsListService, interactionService } from '@resolve/domain';
import type { 
  ProposalData, 
  ContractData, 
  PolicyUpdateData, 
  VendorOnboardingData, 
  InteractionFilters,
} from '@resolve/types'; 
import { getMockDb } from '@resolve/mock-db';
import { IdentityType, PageInfoType } from './identity';
import { ActivityType } from "./activity";

// 1. Declare your core enums
const InteractionTypeEnum = builder.enumType('InteractionType', {
  values: ['PROPOSAL', 'CONTRACT', 'POLICY_UPDATE', 'VENDOR_ONBOARDING'] as const,
});

const InteractionStateEnum = builder.enumType('InteractionState', {
  values: ['DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED'] as const,
});

const InteractionActionEnum = builder.enumType('InteractionAction', {
  values: ['SUBMIT', 'APPROVE', 'REJECT', 'RESUBMIT'] as const,
});

// 1. Create the Object Reference blueprints first
const ProposalDataRef = builder.objectRef<ProposalData>('ProposalData');
const ContractDataRef = builder.objectRef<ContractData>('ContractData');
const PolicyUpdateDataRef = builder.objectRef<PolicyUpdateData>('PolicyUpdateData');
const VendorOnboardingDataRef = builder.objectRef<VendorOnboardingData>('VendorOnboardingData');

// 2. Separate implementation blocks into dedicated statements
export const ProposalDataType = ProposalDataRef.implement({
  fields: (t) => ({
    summary: t.exposeString('summary'),
    amount: t.exposeFloat('amount'),
    currency: t.exposeString('currency'),
    effectiveDate: t.exposeString('effectiveDate'),
    expirationDate: t.exposeString('expirationDate', { nullable: true }),
  }),
});

export const ContractDataType = ContractDataRef.implement({
  fields: (t) => ({
    summary: t.exposeString('summary'),
    contractValue: t.exposeFloat('contractValue'),
    termLengthMonths: t.exposeInt('termLengthMonths'),
    autoRenew: t.exposeBoolean('autoRenew'),
  }),
});

export const PolicyUpdateDataType = PolicyUpdateDataRef.implement({
  fields: (t) => ({
    summary: t.exposeString('summary'),
    policyArea: t.exposeString('policyArea'),
    effectiveDate: t.exposeString('effectiveDate'),
    impactLevel: t.exposeString('impactLevel'),
  }),
});

export const VendorOnboardingDataType = VendorOnboardingDataRef.implement({
  fields: (t) => ({
    summary: t.exposeString('summary'),
    vendorType: t.exposeString('vendorType'),
    riskLevel: t.exposeString('riskLevel'),
    onboardingChecklistComplete: t.exposeBoolean('onboardingChecklistComplete'),
  }),
});

// Create the unified GraphQL Union for the dynamic 'data' field
const InteractionDataUnion = builder.unionType("InteractionData", {
  types: [
    ProposalDataType,
    ContractDataType,
    PolicyUpdateDataType,
    VendorOnboardingDataType,
  ],
  resolveType(dataValue: any) {
    if ("contractValue" in dataValue) {
      return "ContractData";
    }

    if ("policyArea" in dataValue) {
      return "PolicyUpdateData";
    }

    if ("vendorType" in dataValue) {
      return "VendorOnboardingData";
    }

    if ("amount" in dataValue) {
      return "ProposalData";
    }

    throw new Error(
      `Unknown interaction data type: ${JSON.stringify(dataValue)}`
    );
  },
});

// 3. Define the ToastNotification structural type
const ToastNotificationType = builder.objectRef('ToastNotification').implement({
  fields: (t) => ({
    message: t.exposeString('message'),
    type: t.exposeString('type'),
  }),
});

// 4. Define the InteractionParty relational type
const InteractionPartyType = builder.objectRef('InteractionParty').implement({
  fields: (t) => ({
    role: t.exposeString('role'),
    identity: t.field({
      type: IdentityType,
      resolve: (parentParty) => parentParty.identity,
    }),
  }),
});


// 5. Implement the main Interaction Type Ref
export const InteractionType = builder.objectRef('Interaction').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    workspaceId: t.exposeID('workspaceId'),
    title: t.exposeString('title'),
    description: t.exposeString('description', { nullable: true }),
    createdAt: t.exposeString('createdAt'),
    updatedAt: t.exposeString('updatedAt'),

    // Expose your mapped enums and unions
    // type: t.expose('type', { type: InteractionTypeEnum }),
    // status: t.expose('status', { type: InteractionStateEnum }),

    // Exposed as String instead of GraphQL enums.
    //
    // This avoids GraphQL field conflicts in the SearchResult union
    // (Identity.type/status vs Interaction.type/status).
    //
    // Domain models remain strongly typed via InteractionType and
    // InteractionState in @resolve/types.
    type: t.string({
      resolve: parent => parent.type,
    }),
    status: t.string({
      resolve: parent => parent.status,
    }),
    data: t.expose('data', { type: InteractionDataUnion }),
    
    permittedActions: t.expose('permittedActions', { type: [InteractionActionEnum], nullable: true }),
    notifications: t.expose('notifications', { type: [ToastNotificationType], nullable: true }),
    activities: t.expose('activities', { type: [ActivityType] }),

     creator: t.expose("creator", {
      type: IdentityType,
    }),

    currentReviewer: t.expose("currentReviewer", {
      type: IdentityType,
    }),

    parties: t.expose("parties", {
      type: [InteractionPartyType],
    }),
  }),
});

export const InteractionFiltersInput = builder.inputRef<InteractionFilters>('InteractionFilters').implement(
  {
    fields: (t) => ({
      identityId: t.string(),
      interactionId: t.string(),
      searchQuery: t.string(),
      startDate: t.string(),
      endDate: t.string(),
      // GraphQL natively handles string arrays for multi-select filters
      status: t.stringList(),
      type: t.stringList(),
      parties: t.stringList(),
    }),
  }
);

const InteractionsSortEnum = builder.enumType("InteractionsSort", {
  values: {
    recent: { value: "recent" },
    oldest: { value: "oldest" },
    created: { value: "created" },
  } as const,
});

// 2. New Identities Connection Object Ref (No manual field typing!)
const InteractionsConnectionType = builder.objectRef('InteractionsConnection').implement({
  fields: (t) => ({
    results: t.expose('results', { type: [InteractionType] }),
    pageInfo: t.expose('pageInfo', { type: PageInfoType }), // Pure reference—no inline function call!
  }),
});

builder.mutationType({});

builder.mutationFields((t) => ({
  
  // This key MUST match the field name inside your frontend client operation string
  transitionInteraction: t.field({
    type: InteractionType, // Returns the freshly updated interaction record shape!
    args: {
      id: t.arg.id({ required: true }),
      action: t.arg({ type: InteractionActionEnum, required: true }),
      actorId: t.arg.id({ required: true }),
      workspaceId: t.arg.id({ required: true }),
      comment: t.arg.string(), // Optional field (defaults to undefined/nullable)
    },
    resolve: async (_root, args) => {
      try {
        // 3. Call your exact same domain logic method that your REST route uses!
        const result = await interactionService.executeTransition({
          id: args.id,
          action: args.action as any, // Casts gracefully into your InteractionAction enum
          actorId: args.actorId,
          workspaceId: args.workspaceId,
          comment: args.comment ?? undefined,
        });
        // 4. Return the database record; Pothos handles formatting the response payload
        return result;
      } catch (error) {
        // Gracefully translate backend workflow crashes into standard GraphQLErrors
        const message = error instanceof Error ? error.message : "Unknown Workflow Error";
        throw new Error(message);
      }
    },
  }),
}));

builder.queryFields((t) => ({
  interactions: t.field({
    type: InteractionsConnectionType,
    // Expose EVERY possible argument frontend queries might pass
    args: {
      workspaceId: t.arg.id({ required: true }),
      sortBy: t.arg({
        type: InteractionsSortEnum,
      }),
      offset: t.arg.int(),
      limit: t.arg.int(),
      filters: t.arg({
        type: InteractionFiltersInput,
      }),
      identityId: t.arg.id(),
    },
    resolve: async (_root, args) => {
      // 2. Build your unified variables map, gracefully falling back to defaults
      console.info("args=",args);
      const filters = args.filters ?? {};
      const vars = {
        workspaceId: args.workspaceId,
        sortBy: args.sortBy ?? null,
        offset: args.offset ?? 0,
        limit: args.limit ?? 50,
        filters: {
          status: filters.status ?? [],
          type: filters.type ?? [],
          parties: filters.parties ?? [],
          identityId: filters.identityId ?? args.identityId ?? null,
          searchQuery: filters.searchQuery ?? null,
          startDate: filters.startDate ?? null,
          endDate: filters.endDate ?? null,
        },
      };
      //throw new Error("INTERACTIONS RESOLVER");

      // 3. Invoke the exact same service method your REST endpoints execute
      return interactionsListService.processInteractions(
        getMockDb().interactions, 
        vars
      );
    },
  }),

  // FIELD 2: Singular field for your Interaction Detail Page
  interaction: t.field({
    type: InteractionType, // Notice this is NOT wrapped in an array bracket!
    args: {
      workspaceId: t.arg.id({ required: true }),
      id: t.arg.id({ required: true }), // Maps to your frontend's $interactionId
    },
    resolve: async (_root, args) => {
      const item = await interactionService.getInteraction(args.workspaceId, args.id);
      
      if (!item) throw new Error('Interaction not found');
      return item;
    },
  }),

  parties: t.field({
    type: [IdentityType], // Reuses your master Identity blueprint array!
    args: {
      workspaceId: t.arg.id({ required: true }),
    },
    resolve: async (_root, args) => {
      const db = getMockDb();
      const referenceData = await interactionsListService.processReferenceData(
        db.interactions,
        args.workspaceId
      );
      
      // Extract the parties list (hydrated identities) from your service response
      // Fallback to searching identities if your reference data returns primitive records
      return referenceData?.parties || db.identities.filter(id => id.workspaceId === args.workspaceId);
    },
  }),

  // FIELD 2: Returns an array of simple string status tokens
  interactionStatuses: t.field({
    //type: [t.string()], // Defines an array of standard strings [String!]!
    type: ['String'], 
    resolve: async () => {
      // You can read this straight from your exported core constant arrays:
      // ["DRAFT", "IN_REVIEW", "APPROVED", "REJECTED"]
      return ["DRAFT", "IN_REVIEW", "APPROVED", "REJECTED"];
    },
  }),

  // FIELD 3: Returns an array of simple string type tokens
  interactionTypes: t.field({
    //type: [t.string()],
    type: ['String'], 
    resolve: async () => {
      return ["PROPOSAL", "CONTRACT", "POLICY_UPDATE", "VENDOR_ONBOARDING"];
    },
  }),
}));
