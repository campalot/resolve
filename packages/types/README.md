# @resolve/types — Data Model Package for Resolve ecosystem


## Core Domain Model

The Resolve ecosystem models a small set of primary domain concepts:

**Workspace** 

`Workspace` Represents a top-level container that owns and isolates all data, users, and activities in the application.
```typescript
type Workspace = {
  id: string;
  name: string;
};
```
**Interaction** 

`Interaction` is the resolved domain representation of a workflow interaction (e.g., contract, review, approval flow).  It contains the interaction's core attributes along with resolved identity relationships used by consuming applications.

```typescript
type Interaction = {
  __typename?: "Interaction";
  id: string;
  workspaceId: string;
  title: string;
  status: InteractionState;
  type: InteractionType;
  data: InteractionDataRecord;
  parties: InteractionParty[];
  currentReviewer: Identity | null;
  creator: Identity;
  createdAt: string;
  updatedAt: string;
  description?: string;
  notifications?: ToastNotification[]; 
  permittedActions?: InteractionAction[];
  activities?: InteractionActivity[];
};
```
**Identity** 

`Identity` is the resolved domain representation of a person or company.  It contains the identity's core attributes along with resolved identity relationships and derived activity statistics used by consuming applications.
```typescript
type Identity = {
  __typename?: "Identity";
  id: string;
  workspaceId: string;
  name: string;
  type: IdentityType;
  status: IdentityStatus;
  avatarUrl?: string;
  stats?: IdentityStats;

  // Optional metadata (keep minimal)
  industry?: string;
  country?: string;
  company?: Identity;
  personKey?: string;
  createdAt: string;
};
``` 
**InteractionActivity** 

`InteractionActivity` is the resolved domain representation of a lifecycle events tied to an interaction.  It contains the activity's core attributes along with resolved identity relationships (actors, reviewers, decision-makers) and type-specific metadata used by consuming applications, creating a connected lifecycle history across entities.

```typescript
type InteractionActivity = {
  __typename?: "InteractionActivity";
  id: string;
  workspaceId: string;
  interactionId: string;
  interactionTitle: string;
  type: InteractionActivityType;
  occurredAt: string;
  actor: Identity;
  metadata: InteractionActivityMetadata;
};
```
**SearchResult** 

`SearchResult` is a union type that allows search across multiple entity types. Search results use resolved domain types rather than record types, allowing consumers to work with the same entity representations used elsewhere in the application.

```typescript
type SearchResult = Interaction | Identity;

type SearchResponse = {
  results: SearchResult[];
  pageInfo: PageInfo;
};
``` 

The goal is not to simulate every possible business rule, but to model realistic relationships between entities and maintain consistency across views.

## Secondary Domain Models

Besides the core domain concepts, Resolve models several related domain concepts that are used for specific implementations:

**CurrentUser** 

`CurrentUser` represents the authenticated application user and the application-level context associated with that user. It is distinct from an `Identity`, which represents a person or company participating in the Resolve domain.

A CurrentUser identifies who is using the application and which workspaces and application role are available to them. An Identity represents a domain participant associated with interactions and other business entities.

```typescript
type CurrentUser = {
  id: string;
  name: string;
  accessibleWorkspaceIds: string[];
  role: "Legal" | "Finance" | "Admin";
};
```
**DashboardInteraction** 

A purpose-built application-facing representation of an interaction for dashboard lists. It adds information derived from the current user's relationship to the interaction and resolves the latest activity into a display-oriented activity description.
```typescript
type DashboardInteraction = {
  id: string;
  title: string;
  status: InteractionState;
  relationship: InteractionRelationship | null;
  latestActivity: string | StatusChangeObj;
  updatedAt: string;
  parties: InteractionParty[];
}
```
**Connection Types** 

Various connection types which model the common shape for returned lists of entities.
```typescript
type IdentitiesConnection = {
  results: Identity[];
  pageInfo: PageInfo;
};

type InteractionsConnection = {
  results: Interaction[];
  pageInfo: PageInfo;
};

type ActivitiesConnection = {
  results: InteractionActivity[];
  pageInfo: ActivitiesPageInfo;
};
```


## Record vs. Presentation Types

The @resolve/types package distinguishes between Record types, which represent persisted or retrieved domain data, and resolved types, which represent the domain data after relationships and other required information have been resolved for application consumption.

These resolved types may combine, transform, or omit record data, into what are often the shapes ultimately consumed by UI layers.

For example:

```typescript
export type InteractionRecord = {
  id: string;
  workspaceId: string;
  title: string;
  status: InteractionState;
  type: InteractionType;
  data: InteractionDataRecord;
  parties: InteractionPartyRecord[];
  currentReviewerId?: string | null;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
};

export type Interaction = {
  __typename?: "Interaction";
  id: string;
  workspaceId: string;
  title: string;
  status: InteractionState;
  type: InteractionType;
  data: InteractionDataRecord;
  parties: InteractionParty[];
  currentReviewer: Identity | null;
  creator: Identity;
  createdAt: string;
  updatedAt: string;
  description?: string;
  notifications?: ToastNotification[]; 
  permittedActions?: InteractionAction[];
  activities?: InteractionActivity[];
};
```

The important distinction is not that every Record has a corresponding Presentation type with a fixed transformation. Rather, the pattern establishes a boundary:

> Records represent domain data as persisted or retrieved by the backend; presentation types represent data after the necessary domain resolution and shaping for application consumption.

This allows services to resolve relationships and construct useful application-facing data without requiring UI components to understand the underlying record structure.

The same pattern is used throughout the domain model, including:

- `IdentityRecord` → `Identity`
- `InteractionRecord` → `Interaction`
- `InteractionActivityRecord` → `InteractionActivity`
- `InteractionPartyRecord` → `InteractionParty`

There are also presentation-oriented types that do not correspond directly to a single record, such as `DashboardInteraction`, which is intentionally composed by a service for a particular application use case.
