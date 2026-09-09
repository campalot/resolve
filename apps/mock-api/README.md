# @resolve/mock-api — Backend application for Resolve ecosystem

`@resolve/mock-api` is the backend application used by the Resolve ecosystem for both local development and deployment. It provides a single API boundary for the Vite SPA and Next.js Portal, exposing the same domain services through both REST and GraphQL.

The API is intentionally thin. It handles the concerns that belong at the application boundary — HTTP requests, session and workspace context, authentication-related request information, API transport, and storage configuration — while leaving domain behavior and data management to shared packages.

The goal is to make the deployed demo behave like a real application without requiring a production-scale backend infrastructure.

### What it is
- A Fastify-based API server
- A REST and GraphQL gateway into the shared domain services
- The point where request context is established
- The place where the appropriate storage strategy is selected
- The application boundary between frontend clients and the shared domain/data layers

### What it is not
- A second implementation of domain logic
- A database or data-access layer
- A frontend-specific API
- A production authentication or authorization service

The application is intentionally focused on coordinating these concerns rather than owning them.

## Why Fastify?

Fastify provides a small, well-defined HTTP application boundary without adding much infrastructure around the demo. It gives the API the routing, request lifecycle hooks, cookie handling, and plugin structure needed to support both local development and serverless deployment while keeping the application layer relatively thin.


## 🛠 Architectural Overview

The API provides a single entry point for both REST and GraphQL requests. Both transports ultimately use the same domain services and mock database infrastructure. It does not contain business or data-manipulation logic itself; instead, it coordinates three key pillars of our architecture:

1. **Context & Identity Capture:** Inspects incoming cookies and network headers to establish tenancy and test environments.
2. **Unified Domain Services:** Routes both REST endpoints and GraphQL resolvers through identical, shared services found in the @resolve/domain package.
3. **Storage Configuration:** Selects the appropriate storage adapter for each request and loads the required workspace data before the request is processed. 


              React Vite SPA          Next.js Portal
                    │                       │
                    └───────────┬───────────┘
                                │
                         REST / GraphQL
                                │
                                ▼
                    ┌─────────────────────┐
                    │   @resolve/mock-api │
                    │   Fastify Gateway   │
                    └──────────┬──────────┘
                               │
                  ┌────────────┴────────────┐
                  ▼                         ▼
        ┌──────────────────┐      ┌──────────────────┐
        │ @resolve/domain  │      │ @resolve/mock-db │
        │ Shared Services  │      │ Storage Engine   │
        └──────────────────┘      └──────────────────┘



## 🔌 REST & GraphQL

The API exposes the same underlying services through both REST and GraphQL. The transport changes, but the domain and data path do not.

### 1. Shared Domain Services

REST routes and GraphQL resolvers are intentionally thin. Both call the same service functions in `@resolve/domain`, so the two API styles exercise the same application behavior.

### 2. Schema Stitching with Pothos & Mercurius

GraphQL is implemented with Mercurius and Pothos. Rather than maintaining a single schema definition, the schema is composed from strongly typed definitions organized around the application's domain areas.

- **Pothos Schema Builder:** We use a centralized SchemaBuilder powered by PothosConfig.
- **Shared Types:** The GraphQL types are mapped cleanly from pre-existing TypeScript contracts defined in our @resolve/types package.
- **Domain Sharding:** The graph schema is split cleanly into isolated files across our decoupled domain models:
  - 💬 interaction (User events and communications)
  - 📈 activity (Audit trails and system actions)
  - 🗂 workspace (Multi-tenant company configurations)
  - 🔍 search (Unified lookup and querying)
  

## 🧠 Request Context & Storage Configuration
  
The Fastify `preHandler` establishes the context needed by downstream services before a request is processed.

It:

1. Identifies test requests and establishes their session context.
2. Determines which storage adapter should be used.
3. Resolves the session and workspace identifiers.
4. Attaches the resulting context to the request.
5. Hydrates the appropriate workspace data before the request reaches the domain layer.
  
```typescript
fastify.addHook('preHandler', async (request, reply) => {
  const isTestRequest =
    request.headers['x-resolve-test-context'] === 'true';

  configureStorage(
    isTestRequest
      ? TestStorage
      : hasUpstashCredentials
        ? UpstashRedisStorage
        : NodeStorage
  );

  const sessionId = resolveSessionId(request);
  const workspaceId = resolveWorkspaceId(request);

  request.sessionContext = {
    sessionId,
    currentWorkspaceId: workspaceId,
  };

  await runAgnosticDatabaseHydration(sessionId, workspaceId);
});
```


### Key Responsibilities of the Interceptor

- **Test Request Isolation:** Identifies requests coming from the test runner and switches to the in-memory `TestStorage`, using the session identifier supplied by the test rather than relying on browser cookies.

- **Request Context:** Establishes the session and workspace context needed by downstream services. REST routes and GraphQL requests provide this information through their respective request parameters and payloads.

- **Workspace Hydration:** Ensures the appropriate workspace data is loaded into the mock database before the request reaches the service layer.


## Request Lifecycle 
```
Incoming Request
       │
       ▼
Fastify preHandler
       │
       ├── Resolve session/workspace context
       ├── Select storage adapter
       └── Hydrate workspace data
       │
       ▼
REST route / GraphQL resolver
       │
       ▼
@resolve/domain service
       │
       ▼
@resolve/mock-db
       │
       ├── Query in-memory state
       └── Persist mutations
       │
       ▼
Response
```


The API establishes the request context and prepares the mock database before handing control to the domain layer. Domain services operate on the hydrated in-memory state without needing to know whether that state ultimately came from Redis, the local filesystem, or test memory.

## 🧱 Package Boundaries

- `@resolve/mock-db` owns mock data generation, workspace hydration, persistence, and the StorageAdapter abstraction.
- `@resolve/types` contains the TypeScript contracts used by the domain and API layers, including the types used to construct the GraphQL schema.
