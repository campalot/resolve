# @resolve/mock-db — Mock Database Package for Resolve ecosystem

A storage-agnostic, stateful mock database engine used by the Resolve ecosystem to generate, hydrate, and persist deterministic mock data across session and workspace boundaries.

## Responsibilities

- mock data generation
- in-memory request state
- hydration/persistence
- storage abstraction
- session/workspace isolation

## Data & Scope
The mock database consists of separate arrays for each of the primary domain models defined in the @resolve/types package, and is seeded initially for demo purposes. 

The generated data is organized into isolated "chunks", which are then loaded, saved, and cleared based on specific identifiers.

```typescript
export type WorkspaceDataProps = {
  identities: IdentityRecord[];
  interactions: InteractionRecord[];
  interactionActivities: InteractionActivityRecord[];
}
```

### Identity & Workspace Scope Mapping

Session and workspace identifiers establish the isolation boundaries used by the mock database.

```
sessionId   → visitor/session scope
workspaceId → tenant/workspace scope
```

The session identifies the visitor. The request identifies in which workspace the visitor is operating. So depending on the type of storage, for each workspace, one user may have:

Separate Redis keys:

```
demo:session:465137e9-8826-41ad-ba6e-51b0891105d2:w:alpha
demo:session:465137e9-8826-41ad-ba6e-51b0891105d2:w:beta
demo:session:465137e9-8826-41ad-ba6e-51b0891105d2:w:workspaces
```

.. or separate saved JSON files:
```
session_32323f07-d6d8-4a68-9682-e5ba2161562c_workspace_alpha.json
session_32323f07-d6d8-4a68-9682-e5ba2161562c_workspace_beta.json
session_32323f07-d6d8-4a68-9682-e5ba2161562c_workspace_workspaces.json
```

### Workspace "Shards"
Based on the `WorkspaceDataProps` interface above, a typical workspace "shard" looks something like this. The example is abbreviated, but shows the structure of each collection and the relationships between records:

```json
{
  "identities": [
    {
      "id": "company-4349b666-f0cb-4eed-807b-66dbf77d6df0",
      "workspaceId": "alpha",
      "name": "Apex Solutions",
      "type": "Company",
      "status": "Active",
      "industry": "Energy",
      "country": "US",
      "createdAt": "2026-06-20T22:54:14.028Z"
    },
    {
      "id": "company-21f6c2ab-0394-4500-8bca-1f569e73c044",
      "workspaceId": "alpha",
      "name": "Aether Tech",
      "type": "Company",
      "status": "Active",
      "industry": "Energy",
      "country": "US",
      "createdAt": "2026-06-20T21:30:05.387Z"
    },
    // Additional IdentityRecords
  ],
  "interactions": [
    {
      "id": "alpha_fjgr5ww9",
      "workspaceId": "alpha",
      "title": "Policy Update – Security",
      "type": "POLICY_UPDATE",
      "data": {
        "summary": "Update to internal policy requirements.",
        "policyArea": "Security",
        "effectiveDate": "2026-11-24",
        "impactLevel": "Medium"
      },
      "parties": [
        {
          "identityId": "person-charles-rogers-alpha",
          "role": "Partner"
        },
        {
          "identityId": "person-amelia-brown-alpha",
          "role": "Partner"
        }
      ],
      "status": "APPROVED",
      "updatedAt": "7/8/2026, 8:06:39 PM",
      "createdAt": "2026-06-02",
      "creatorId": "person-amelia-brown-alpha",
      "currentReviewerId": null,
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
      "id": "alpha_l4jt3z00",
      "workspaceId": "alpha",
      "title": "Contract – 12 Month Term",
      "type": "CONTRACT",
      "data": {
        "summary": "Contract agreement outlining services and obligations.",
        "contractValue": 131663,
        "termLengthMonths": 12,
        "autoRenew": false
      },
      "parties": [
        {
          "identityId": "person-logan-walker-alpha",
          "role": "Partner"
        },
        {
          "identityId": "person-maverick-bailey-alpha",
          "role": "Partner"
        }
      ],
      "status": "REJECTED",
      "updatedAt": "6/12/2026, 4:15:02 PM",
      "createdAt": "2026-05-13",
      "creatorId": "person-logan-walker-alpha",
      "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "currentReviewerId": null
    },
    // Additional InteractionRecords
  ],
  "interactionActivities": [
    {
      "__typename": "InteractionActivityRecord",
      "id": "activity-f17ff6db-accd-4d61-a662-5cd8f5bb01eb",
      "workspaceId": "alpha",
      "interactionId": "alpha_3yxn1g4y",
      "interactionTitle": "Contract – 12 Month Term",
      "type": "INTERACTION_CREATED",
      "occurredAt": "8/31/2026, 6:07:00 PM",
      "actorId": "person-addison-kim-alpha",
      "metadata": {
        "__typename": "InteractionActivityMetadata_Created",
        "initialStatus": "DRAFT"
      }
    },
    {
      "__typename": "InteractionActivityRecord",
      "id": "activity-f5c1aced-7a9b-4053-9709-72892f2b9875",
      "workspaceId": "alpha",
      "interactionId": "alpha_wnghljaj",
      "interactionTitle": "Policy Update – Security",
      "type": "INTERACTION_DECIDED",
      "occurredAt": "8/30/2026, 9:16:07 AM",
      "actorId": "person-hazel-flores-alpha",
      "metadata": {
        "__typename": "InteractionActivityMetadataRecord_Decision",
        "finalStatus": "REJECTED",
        "decisionMakerId": "person-paisley-patel-alpha"
      }
    },
    // Additional InteractionActivityRecords
  ]
}
```
<br><br>
## 🔄 The Data Lifecycle

The engine manages state using two distinct concepts. Because this package is context-agnostic, these actions are triggered externally by our backend API framework based on inbound traffic.

- **Hydration:** Loads the session/workspace state from the active storage adapter into the in-memory mock database used by the request.
- **Persistence:** Saves the resulting in-memory state back through the active storage adapter after a mutation.


## 🔌 Storage Architecture (StorageAdapter)

The `StorageAdapter` interface separates the mock database engine from its persistence mechanism. 

```typescript
export interface StorageAdapter {
  loadWorkspace(sessionId: string, workspaceId: string): Promise<WorkspaceDataProps | null>;
  saveWorkspace(sessionId: string, workspaceId: string, data: WorkspaceDataProps): Promise<void>;
  clearWorkspace?(sessionId: string, workspaceId: string): Promise<void>;
}
```



                    Application
                         │
                  StorageAdapter
                         │
             ┌───────────┼───────────┐
             │           │           │
           Local       Test        Vercel
             │           │           │
        NodeStorage  TestStorage  UpstashRedisStorage
             │           │           │
        filesystem   memory          Redis

<br><br>
## Available Strategies

The active strategy is selected at runtime by the caller:

1. `UpstashRedisStorage` **— Deployed / Durable** 

    Durable session/workspace persistence using Upstash Redis, suitable for the stateless serverless runtime used by the deployed applications.

2. `NodeStorage` **— Local Development** 

    Filesystem persistence using Node's fs/promises, allowing the local Fastify server to maintain state across requests and restarts.

3. `TestStorage` **— Integration Testing** 

    In-memory storage for isolated integration tests. Tests still exercise the real Fastify API and service layer without writing state to external infrastructure.
<br><br>
## Architectural Decisions

### Persistence as an Implementation Detail

The mock database needs durable persistence when the ecosystem is deployed to a serverless environment, but the persistence mechanism is not part of the domain model. The package therefore exposes a StorageAdapter boundary rather than coupling its data engine to a particular database or filesystem.

Upstash Redis provides the durable storage required by the deployed demo while remaining lightweight enough for this purpose. The same interface also supports filesystem storage for local development and in-memory storage for integration tests.

### Data Access Boundary

The mock database operates on a workspace-scoped data shard that is hydrated into memory for request processing. Filtering, sorting, pagination, and domain-specific transformations are handled by the service layer rather than by Redis itself.

The storage adapter keeps persistence concerns separate from the mock database and service layers. The underlying storage can therefore change without changing the domain data model or the way services access that data.
<br><br>
## 🧱 Documentation & System Boundaries

This package does not determine application context; it receives whatever context it needs from its caller. It does not auto-detect environment variables, sniff HTTP headers, parse cookies, or determine which storage adapter to use.

- **Orchestration:** Storage selection and the triggers for runAgnosticDatabaseHydration are handled exclusively in the API layer. For details on how the API layer does this, see the apps/@resolve/mock-api README.
- **Client Implementation:** For details on how the Vite SPA or Next.js portal pass the necessary tracking headers down to the server, see the frontend workspace documentation.
