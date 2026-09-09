# Resolve Monorepo

The Resolve Monorepo is a multi-application demo that explores how independent applications can share domain behavior, contracts, and UI while maintaining clear architectural boundaries.

## Why This Project Exists

In previous roles, I worked on enterprise-style applications involving:

- Workspace scoping
- Workflow lifecycles
- Activity feeds
- URL-driven filtering and pagination
- Mutation-driven state updates

Those systems were proprietary and are no longer publicly accessible. Rather than describe that experience abstractly, this repository reconstructs similar architectural patterns in a standalone, inspectable demo.

The project has since expanded beyond the original application into a small multi-application ecosystem, allowing me to explore additional architectural concerns such as shared packages, a dedicated API layer, shared domain services, and persistence boundaries.

The goal is not to build a startup product mockup. The goal is to demonstrate architectural thinking in a controlled, readable codebase — first through the application itself, and now through how multiple applications and shared capabilities can work together.


## What It Demonstrates

The project is intentionally architecture-focused rather than feature-heavy. It demonstrates:

- **Complex React/TypeScript application architecture** — realistic domain concepts, workflows, navigation, URL-driven state, and application state working together.
- **Shared domain and application boundaries** — business rules, API handling, persistence, and application concerns are separated into clearly defined layers and packages.
- **Multi-application architecture** — the Resolve and Portal applications share contracts and domain behavior while retaining their own application-specific needs.
- **Reusable UI with application-specific behavior** — shared components live in @resolve/ui, with adapters allowing each application to provide its own routing and behavior.
- **Protocol flexibility** — Resolve supports both REST and GraphQL while using the same underlying domain behavior, allowing the data-fetching strategy to change without changing the application's core business rules.
- **Maintainable, practical architecture** — the project favors clear boundaries, explicit responsibilities, and abstractions that solve real problems rather than adding complexity for its own sake.


## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              APPLICATIONS                                   │
│                                                                             │
│   ┌─────────────────────────┐          ┌─────────────────────────┐          │
│   │    Resolve / React      │          │     Portal / Next.js    │          │
│   │                         │          │                         │          │
│   │  Components & Hooks     │          │  Portal Views           │          │
│   │  Zustand App State      │          │  App State              │          │
│   │  Axios Interceptors     │          │  Axios Interceptors     │          │
│   └────────────┬────────────┘          └────────────┬────────────┘          │
│                │                                    │                       │
│                │ REST & GraphQL                     │ REST                  │
│                └────────────────┬───────────────────┘                       │
│                                 ▼                                           │
│                       ┌─────────────────────┐                               │
│                       │  @resolve/mock-api  │                               │
│                       │                     │                               │
│                       │  Fastify API        │                               │
│                       │  Transport          │                               │
│                       │  Request context    │                               │
│                       └──────────┬──────────┘                               │
│                                  ▼                                          │
│                       ┌─────────────────────┐                               │
│                       │   @resolve/domain  │                                │
│                       │                     │                               │
│                       │   Business rules    │                               │
│                       │   Workflow logic    │                               │
│                       │   Record resolution │                               │
│                       │   Mutations         │                               │
│                       └──────────┬──────────┘                               │
│                                  ▼                                          │
│                       ┌─────────────────────┐                               │
│                       │   @resolve/mock-db  │                               │
│                       │                     │                               │
│                       │   Mock data         │                               │
│                       │   Storage           │                               │
│                       │   Persistence       │                               │
│                       └─────────────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────── SHARED PACKAGES ─────────────────────────────┐
│                                                                             │
│   ┌─────────────────────────┐          ┌──────────────────────────────┐     │
│   │      @resolve/ui        │          │       @resolve/types         │     │
│   │                         │          │                              │     │
│   │  Shared UI components   │          │  Shared domain contracts     │     │
│   │  Design tokens          │          │  Roles & actions             │     │
│   │  Shared styling         │          │  Permission definitions      │     │
│   └─────────────────────────┘          └──────────────────────────────┘     │
│                                                                             │
│   @resolve/ui is primarily consumed by the applications.                    │
│   @resolve/types is shared throughout the applications and backend.         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


                           ┌─────────────────────┐
                           │      Storybook      │
                           │                     │
                           │ UI component        │
                           │ development         │
                           └─────────────────────┘
```

The system can be thought of as a few distinct layers, each with a specific responsibility.

### Request & Execution Lifecycle

1\. **The Consumer Apps** — `apps/resolve`, `apps/portal`

These are the applications users interact with.

- **Resolve** is the primary React application and supports both REST and GraphQL.
- **Portal** is the companion Next.js application and currently uses REST.
- Both applications handle their own UI, application state, routing, and data-fetching strategy.

2\. **The Traffic Cop** — `@resolve/mock-api`

The Fastify API sits between the applications and the domain layer.

Its job is to handle incoming requests, establish the request context, and route each request to the appropriate domain operation.

The API is intentionally kept separate from the business rules themselves.

3\. **The Brains** — `@resolve/domain`

This is where the shared application behavior lives.

It applies business rules, handles workflow transitions, resolves related records, and coordinates changes that may affect more than one piece of data.

Because both applications use the same domain layer, the underlying behavior remains consistent regardless of which application or API operation initiated the request.

4\. **The Data Core** — `@resolve/mock-db`

This package provides the data used by the demo system.

It handles the underlying records, workspace-specific data, and persistence used by the applications and tests.

The domain layer works with this data without needing to know how the data is ultimately stored.


### Shared Packages

`@resolve/types`

The shared contracts used throughout the monorepo.

This package defines the common domain types, actions, roles, and other contracts that need to remain consistent between applications and backend packages.

`@resolve/ui`

The shared UI layer used primarily by the applications.

It provides reusable components and design tokens while leaving application-specific behavior such as routing to the consuming application.

**Storybook**

Storybook provides an isolated environment for developing and testing the shared UI components in @resolve/ui. It is a development tool rather than part of the runtime application flow.


## Architectural Principles

These five core pillars guide how we write, organize, and scale code across this monorepo. They ensure that as the project grows, it remains maintainable, predictable, and simple.

### 🛣️ 1. Stay in Your Lane

**The layers have clear responsibilities, and we don't bypass them just because a shortcut is convenient.**

Our architecture relies on an intentional dependency graph. Applications handle user views, `@resolve/mock-api` strictly manages request transport and context, `@resolve/domain` executes business rules, and `@resolve/mock-db` manages data state.

- **No Direct Shortcuts:** An application never bypasses the API to query the database package directly.
- **Enforced Encapsulation:** If an operation crosses a layer, each layer remains responsible for its part of that operation.

### 🔄 2. Write Once, Hook Everywhere

**Shared capabilities belong in packages when more than one part of the monorepo needs them.**

We do not write duplicate domain types, copy-paste API contracts, or rewrite identical data-fetching boilerplate. If the same capability is genuinely shared by multiple applications, it belongs in a shared package rather than being duplicated.

- **Shared Contracts:** `@resolve/type`s` acts as our compiler-enforced single source of truth for actions, roles, and schemas across boundaries.
- **Encapsulated Queries:** Data fetching is handled via dedicated custom hooks. A hook handles variables, configurations, and cache keys once, letting UI components simply call the hook and render.

### 🎓 3. Abstractions Must Earn Their Keep

**We build for the concrete present, not a hypothetical future. Abstraction is a luxury that code must justify.** 

Over-engineering kills velocity. We don't build generic wrappers or generalized components just for the sake of demonstrating a pattern. If a component or helper has exactly one specific use case, it is completely acceptable to leave it localized and simple.

- **YAGNI (You Aren't Gonna Need It):** We resisted adding a global state manager until the cross-component data flow absolutely demanded it—at which point we adopted a lightweight Zustand store instead of an over-engineered Redux setup.
- **Copy Twice, Abstract Thrice:** A little duplication is preferable to a premature abstraction.

### 🎭 4. Smart Pipelines, Dumb Components

**Data orchestration happens outside the shared UI components, which remain focused on presentation.**

We keep our `@resolve/ui` components pure and "dumb." They should not perform business calculations or own application-specific data orchestration.

- **Presentation, Not Orchestration:** Components receive the data and computed state they need rather than deciding how that data should be fetched, transformed, or authorized.
- **Decoupled Flows:** Keeping components presentational ensures they remain perfectly isolated, easy to test, and easy to develop within Storybook without mocking heavy application state.

### 🧩 5. Change the Plug, Not the Appliance

**Core business execution is entirely agnostic of the infrastructure delivering or storing its data.**

The domain layer applies business rules and coordinates workflows without knowing—or caring—how data is persisted or what protocol is used to request it.

- **Protocol Isolation:** We can switch our API routing from Fastify to another framework, or transport from REST to GraphQL, without touching a single business rule inside `@resolve/domain`.
- **Interchangeable Storage:** The data layer can use different storage implementations without requiring changes to the domain logic.


## Applications

| Application   | Purpose                                        | Documentation                   |
| ------------- | ---------------------------------------------- | ------------------------------- |
| **Resolve**   | Primary administrative React SPA               | [README.md](./apps/resolve/README.md) / [ARCHITECTURE.md](./apps/resolve/ARCHITECTURE.md) |
| **Portal**    | Companion customer-facing Next.js application  | [README.md](./apps/portal/README.md)                     |
| **Storybook** | Isolated development environment for shared UI | —                               |


## Backend Service

| Service | Purpose |
|---|---|
| `@resolve/mock-api` | Fastify API providing REST and GraphQL endpoints for the applications |


## Shared Packages

| Package             | Responsibility                          |
| ------------------- | --------------------------------------- |
| `@resolve/types`    | Shared domain contracts and permissions |
| `@resolve/ui`       | Shared UI components and design tokens  |
| `@resolve/domain`   | Business rules and domain services      |
| `@resolve/mock-db`  | Mock data, storage, and persistence     |
| `@resolve/logger`   | Shared logging                          |
| `@resolve/utils`    | Common utility functions                |

Each package documents its own responsibilities, boundaries, and implementation details. See the package README for more information.


## What to Explore

The Resolve ecosystem can be explored both through the running applications and through the codebase itself.

### Explore the Running Applications

1. **Start in Portal** — Select a user and explore the Dashboard for that user's active and resolved interactions.

2. **Create a request** — Choose a "Common Task" to fill out a create form for a new request.

3. **See it in Resolve** — Open Resolve in another tab and see the new request and related activity reflected in the administrative application.

4. **Switch workspace** — Switch the current workspace and observe the corresponding branding and data. Switch back to confirm that each workspace maintains its own state.

5. **Explore REST / GraphQL in Resolve** — Use the Developer HUD to switch between REST and GraphQL while observing that the application behavior and data remain consistent.

6. **Look at the Network tab** — Compare the requests generated by the two data-fetching strategies.

### Explore the Codebase

7. **Look at package boundaries** — Browse the monorepo structure to see how applications, shared packages, and supporting infrastructure are separated. Follow a feature across package boundaries to see how responsibilities are divided.

8. **Follow a request through the system** — Start with a Portal or Resolve API call and follow it through `@resolve/mock-api`, `@resolve/domain`, and `@resolve/mock-db`.

9. **Explore the application boundaries** — Compare how Resolve and Portal consume the same underlying capabilities while making different application-level choices.


## Running Locally

Run these commands from the root of the monorepo.

### 1. Start the API

The applications depend on the Fastify API provided by `@resolve/mock-api`.

```bash
pnpm --filter mock-api dev
```

### 2. Start an application

The applications can be run independently. Start whichever application you want to explore, along with the API.

**Resolve**
```bash
pnpm --filter resolve-demo dev
```

Then open http://localhost:5173/

**Portal**
```bash
pnpm --filter portal dev
```

Then open http://localhost:3000/

### 3. Explore the API

The API is available at `http://localhost:3001/`.

The GraphQL API can be explored directly through GraphiQL:

`http://localhost:3001/graphiql`
