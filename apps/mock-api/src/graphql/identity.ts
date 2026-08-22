import { builder } from './builder';
import { identityService } from '@resolve/domain';
import { getMockDb } from '@resolve/mock-db';
import type { Identity, IdentityFilters, IdentitiesConnection, IdentityStats, IdentityReference } from '@resolve/types';

export const IdentityReferenceType =
  builder.objectRef<IdentityReference>("IdentityReference");

IdentityReferenceType.implement({
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
  }),
});

export const StatsType = builder.objectRef<IdentityStats>('Stats').implement({
  fields: (t) => ({
    total: t.exposeInt('total'),
    active: t.exposeInt('active'),
    awaiting: t.exposeInt('awaiting'),
    lastActivityAt: t.exposeFloat("lastActivityAt", {
        nullable: true,
    }),
  }),
});

// 1. Compile the Identity type configuration using its backing model properties
export const IdentityType = builder.objectRef<Identity>("Identity");

IdentityType.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    workspaceId: t.exposeID('workspaceId'),
    name: t.exposeString('name'),
    avatarUrl: t.exposeString('avatarUrl', { nullable: true }),
    createdAt: t.exposeString('createdAt'),
    type: t.exposeString('type'),
    status: t.exposeString('status'),
    company: t.expose('company', { type: IdentityType, nullable: true, }),
    country: t.exposeString('country'),
    stats: t.field({
        type: StatsType,
        resolve: (p) => p.stats,
    }),
    // industry: t.exposeString('industry'),
    // personKey: t.exposeString('personKey'),
  }),
});

// 1. Define a standalone ref for PageInfo
export const PageInfoType = builder.objectRef<{ total: number; hasMore: boolean }>('PageInfo').implement({
  fields: (t) => ({
    total: t.exposeInt('total'),
    hasMore: t.exposeBoolean('hasMore'),
  }),
});

const IdentitiesConnectionRef =
  builder.objectRef<IdentitiesConnection>(
    "IdentitiesConnection"
  );

// 2. New Identities Connection Object Ref (No manual field typing!)
const IdentitiesConnectionType = IdentitiesConnectionRef.implement({
  fields: (t) => ({
    // results: t.expose('results', { type: [IdentityType] }),
    // pageInfo: t.expose('pageInfo', { type: PageInfoType }), // Pure reference—no inline function call!
    results: t.field({
        type: [IdentityType],
        resolve: (p) => p.results,
    }),
    pageInfo: t.field({
        type: PageInfoType,
        resolve: (p) => p.pageInfo,
    }),
  }),
});

const IdentityFiltersInput = builder.inputRef<IdentityFilters>('IdentityFilters').implement(
  {
    fields: (t) => ({
      identityId: t.string(),
      searchText: t.string(),
      companyId: t.string(),
      status: t.stringList(),
      type: t.stringList(),
    }),
  }
);

const IdentitySortEnum = builder.enumType("IdentitySort", {
  values: {
    name: { value: "name" },
    interactions: { value: "interactions" },
    active: { value: "active" },
    recent: { value: "recent" },
  } as const,
});

// xInject identities query field straight into the container
builder.queryFields((t) => ({
  identities: t.field({
    type: IdentitiesConnectionType, // Signifies an array array list
    args: {
      workspaceId: t.arg.id({ required: true }),
      offset: t.arg.int(),
      limit: t.arg.int(),
      searchQuery: t.arg.string(),
      filters: t.arg({
        type: IdentityFiltersInput,
      }),
      sortBy: t.arg({
        type: IdentitySortEnum,
      }),
    },
    resolve: async (_root, args) => {
      const filters = args.filters ?? {};
      // Direct pass-through execution to your existing domain service method
      const response = await identityService.processIdentities(getMockDb().identities, {
        workspaceId: args.workspaceId,
        offset: args.offset ?? 0,
        limit: args.limit ?? 12,
        sortBy: args.sortBy ?? "",
        filters: {
          status: filters.status ?? [],
          type: filters.type ?? [],
          identityId: filters.identityId ?? "",
          searchText: filters.searchText ?? "",
          companyId: filters.companyId ?? "",
        },
      });

      return response;
    },
  }),

  // FIELD 2: Singular field for your Profile Detail Page
    identity: t.field({
      type: IdentityType, // Notice this is NOT wrapped in an array bracket!
      args: {
        workspaceId: t.arg.id({ required: true }),
        id: t.arg.id({ required: true }), // Maps to your frontend's $interactionId
      },
      resolve: async (_root, args) => {
        const item = await identityService.processProfile(args.workspaceId, args.id);
        
        if (!item) throw new Error('Identity not found');

        return item.identity;
      },
    }),
}));
