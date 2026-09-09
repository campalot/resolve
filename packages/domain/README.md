# @resolve/domain — Shared Services Package for Resolve ecosystem


## What This Package Owns

`@resolve/domain` owns the behavior that should remain consistent regardless of how the application is accessed.

It is responsible for:

- business rules
- authorization decisions
- workflow transitions
- related-record resolution
- mutation orchestration
- creation of domain side effects such as activity records

It does not own:

- HTTP or GraphQL transport
- session or cookie management
- storage or persistence
- frontend state
- the definition of shared TypeScript contracts


## 🛠 Where It Fits

The domain package sits between the API and data layers:

```text
@resolve/mock-api
        │
        ▼
@resolve/domain
        │
        ▼
@resolve/mock-db
```

The API layer handles transport and request context. The domain layer applies business rules and coordinates data operations. The mock database manages the underlying state and persistence.


<br><br>
## 🔬 Core Service Patterns

Every service included in the package (such as `interactionService`, `identitiesService`, `activitiesService`) follows the same general pattern:

### 1. Logging & Diagnostics

Services use the shared `@resolve/logger` package for structured diagnostics around more complex operations.

Mutations can group related operations and record specific execution phases such as security checks, side effects, and storage operations. Keeping this concern outside the domain services keeps diagnostic behavior consistent without coupling the services to a particular logging implementation.


### 2. Authorization & Role-Based Access

Authorization is evaluated within the domain layer rather than being implemented separately by REST and GraphQL.

Services receive the current role and operation context and evaluate requested actions against the permission definitions provided by `@resolve/types`. Unauthorized operations are rejected before the underlying data is changed.

```typescript
const isAllowed = ROLE_PERMISSIONS[currentRole].includes(action);

if (!isAllowed) {
  throw { status: 403, message: "Unauthorized" };
}
```


### 3. Workflow & State Transitions

Interaction state changes are governed by an explicit workflow configuration rather than being handled independently by each API endpoint.

The transition logic is responsible for:

- validating whether an action is allowed from the current state
- determining the resulting state
- identifying any related reviewer or assignment changes
- creating the corresponding activity records

This keeps the rules for a workflow in one place regardless of whether the mutation originated from REST or GraphQL.


### 4. Record Resolution & Projections

The data stored by mock-db is intentionally fairly flat. The domain layer resolves those records into the related and calculated data needed by the application.

- **Calculated Identity Statistics (`resolveIdentityStats`):** Calculates current identity statistics from the workspace data, such as the number of open interactions or items waiting for a particular reviewer.

- **Related Profile Associations (`resolveProfileAssociations`):** Builds related profile information from the underlying records, including company relationships and references to profiles found in interaction decisions and review assignments.

- **Activity Metadata (`resolveInteractionActivity`):** Resolves the different types of activity metadata into the expected shape for the application, using the `__typename` field to determine which fields apply to each activity.

- **Safe Identity Projections (`projectIdentityForActivity`):** Controls which identity fields are included when an identity is included in an activity record. This keeps related records from expanding into unnecessary or circular object structures.

<br><br>
## 📂 Package Structure

The package is organized around shared services and common domain utilities. Individual `*Service.ts` modules expose the operations used by both REST routes and GraphQL resolvers, while shared logic handles workflow transitions, record resolution, and cross-cutting behavior.


<br><br>
## Documentation Boundaries

This package owns domain behavior, but it does not own the contracts, transport layer, or persistence implementation.

- **Data Contracts:** Domain types, roles, actions, and permission definitions are provided by `@resolve/types`.
- **API & Request Context:** HTTP handling, cookies, headers, session context, and REST/GraphQL transport are handled by `@resolve/mock-api`.
- **Data & Persistence:** Mock data generation, in-memory state, hydration, and persistence are handled by `@resolve/mock-db`.


