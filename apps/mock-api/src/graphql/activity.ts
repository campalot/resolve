import { builder } from './builder';
import { IdentityType } from './identity';
import { getMockDb, runAgnosticDatabaseHydration } from '@resolve/mock-db';
import { activitiesService } from '@resolve/domain';
import type {
  InteractionActivityMetadata_Status,
  InteractionActivityMetadata_Reviewer,
  InteractionActivityMetadata_Comment,
  InteractionActivityMetadata_Decision,
  InteractionActivityMetadata_Created,
  ActivitiesConnection,
  InteractionParty,
  InteractionActivity,
  ActivitiesPageInfo
} from '@resolve/types';
import { InteractionFiltersInput } from "./interaction";
 
// Register your core activity enums
const ActivityTypeEnum = builder.enumType('InteractionActivityType', {
  values: ['INTERACTION_CREATED', 'STATUS_CHANGED', 'REVIEWER_ASSIGNED', 'COMMENT_ADDED', 'INTERACTION_DECIDED'] as const,
});

// Define Object Reference blueprints for the metadata variants
const StatusMetaRef = builder.objectRef<InteractionActivityMetadata_Status>('InteractionActivityMetadata_Status');
const ReviewerMetaRef = builder.objectRef<InteractionActivityMetadata_Reviewer>('InteractionActivityMetadata_Reviewer');
const CommentMetaRef = builder.objectRef<InteractionActivityMetadata_Comment>('InteractionActivityMetadata_Comment');
const DecisionMetaRef = builder.objectRef<InteractionActivityMetadata_Decision>('InteractionActivityMetadata_Decision');
const CreatedMetaRef = builder.objectRef<InteractionActivityMetadata_Created>('InteractionActivityMetadata_Created');

// Implement the distinct standalone variant shapes
export const StatusMetaType = StatusMetaRef.implement({
  fields: (t) => ({
    previousStatus: t.exposeString('previousStatus'),
    newStatus: t.exposeString('newStatus'),
  }),
});

// Declare a clean, explicit Object Reference blueprint for the party structure
const InteractionPartyStubType = builder.objectRef<InteractionParty>('InteractionPartyStub').implement({
  fields: (t) => ({
    role: t.exposeString('role'),
    identity: t.field({
      type: IdentityType,
      resolve: (parentParty) => parentParty.identity,
    }),
  }),
});

// Use it directly inside the Reviewer Metadata definition block
export const ReviewerMetaType = ReviewerMetaRef.implement({
  fields: (t) => ({
    nextReviewer: t.field({
      type: InteractionPartyStubType, // Reference the clean blueprint—no inline function call!
      resolve: (parentMetadata) => {
        return parentMetadata.nextReviewer;
      }
    }),
  }),
});

const CreatedMetaType = CreatedMetaRef.implement({
  fields: (t) => ({
   initialStatus: t.exposeString('initialStatus'),
  }),
});

export const CommentMetaType = CommentMetaRef.implement({
  fields: (t) => ({
    commentExcerpt: t.exposeString('commentExcerpt'),
  }),
});

export const DecisionMetaType = DecisionMetaRef.implement({
  fields: (t) => ({
    finalStatus: t.exposeString('finalStatus'),
    decisionMaker: t.field({ 
      type: IdentityType, 
      resolve: (p) => {
        return p.decisionMaker; 
      },
    }),
  }),
});

// Group them into the unified metadata union type
const ActivityMetadataUnion = builder.unionType('InteractionActivityMetadata', {
  types: [StatusMetaType, ReviewerMetaType, CommentMetaType, DecisionMetaType, CreatedMetaType],
  resolveType(metaValue: any) {
    switch (metaValue.__typename) {
      case "InteractionActivityMetadata_Status":
      case "InteractionActivityMetadata_Reviewer":
      case "InteractionActivityMetadata_Comment":
      case "InteractionActivityMetadata_Created":
      case "InteractionActivityMetadata_Decision":
        return metaValue.__typename;
      default:
        return null;
    }
  }
});

// Implement the Master Activity Type Ref
export const ActivityType = builder.objectRef<InteractionActivity>('InteractionActivity').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    workspaceId: t.exposeString('workspaceId'),
    interactionId: t.exposeString('interactionId'),
    interactionTitle: t.exposeString('interactionTitle'),
    occurredAt: t.exposeString('occurredAt'),
    
    type: t.expose('type', { type: ActivityTypeEnum }),
    metadata: t.expose('metadata', { type: ActivityMetadataUnion }),

    actor: t.expose("actor", {
      type: IdentityType,
    }),
  }),
});

// Declare a clean, explicit Object Reference blueprint for the party structure
const ActivitiesPageInfoType = builder.objectRef<ActivitiesPageInfo>('ActivitiesPageInfo').implement({
  fields: (t) => ({
    total: t.exposeInt('total'),
    hasMore: t.exposeBoolean('hasMore'),
    comments: t.exposeInt('comments'),
  }),
});

const ActivitiesConnectionRef =
  builder.objectRef<ActivitiesConnection>(
    "ActivitiesConnection"
  );

// Map the connection type container for the standalone paginated query
const ActivitiesConnectionType = ActivitiesConnectionRef.implement({
  fields: (t) => ({
    results: t.field({
      type: [ActivityType],
      resolve: (p) => p.results,
    }),
    pageInfo: t.field({
      type: ActivitiesPageInfoType,
      resolve: (p) => p.pageInfo,
    }),
  }),
});

// Inject the two parallel endpoints straight to the global query bucket
builder.queryFields((t) => ({
  
  // ENDPOINT 1: Used by GET_PROFILE query (Parallel call, returns array)
  activities: t.field({
    type: [ActivityType],
    args: {
      workspaceId: t.arg.id({ required: true }),
      actorId: t.arg.id(), // Links query to the specific active profile filter
    },
    resolve: async (_root, args, context) => {
      const { sessionId } = context.sessionContext;
      const workspaceId = args.workspaceId || context.sessionContext.currentWorkspaceId;
      await runAgnosticDatabaseHydration(sessionId, workspaceId);
      const response = await activitiesService.getProfileActivities(args.workspaceId, args.actorId || "");
  
      return response;
    },
  }),

  // ENDPOINT 2: Used by the standalone GET_INTERACTION_ACTIVITIES query (Returns connection)
  interactionActivities: t.field({
    type: ActivitiesConnectionType,
    args: {
      workspaceId: t.arg.string({ required: true }),
      offset: t.arg.int(),
      limit: t.arg.int(),
      // Flexible loose filter input parsing matching your front-end vars
      filters: t.arg({
        type: InteractionFiltersInput,
      }),
    },
    resolve: async (_root, args, context) => {
      const { sessionId } = context.sessionContext;
      const workspaceId = args.workspaceId || context.sessionContext.currentWorkspaceId;
      await runAgnosticDatabaseHydration(sessionId, workspaceId);
      const db = getMockDb();
      return activitiesService.processActivities(db.interactionActivities, {
        workspaceId: args.workspaceId,
        offset: args.offset ?? 0,
        limit: args.limit ?? 20,
        filters: { interactionId: args.filters?.interactionId ?? undefined },
      });
    },
  }),
}));