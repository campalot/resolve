import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import type { InteractionState } from "@resolve/types";
import { activeRoleVar } from "./cache";
import { getPermittedActions } from "./mocks/common/resolvers";

// This tells Apollo: "Send all GQL queries to this local path"
const httpLink = new HttpLink({
  uri: ({ operationName }) => `/graphql?op=${operationName}`,
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    canonizeResults: false, // Turn this off to prevent the timeout
    typePolicies: {
      Query: {
        fields: {
          _roleDependency: {
            read() {
              return activeRoleVar();
            },
          },
          search: {
            keyArgs: ["workspaceId", "queryString"],
            merge(existing, incoming, { args }) {
              const offset = args?.offset ?? 0;
              // 1. Maintain the existing results or start fresh
              const mergedResults = existing ? [...existing.results] : [];
              
              // 2. Splice incoming results into the specific offset position
              for (let i = 0; i < incoming.results.length; ++i) {
                mergedResults[offset + i] = incoming.results[i];
              }

              // 3. Return a combined object, but ensure the structure is stable
              return {
                ...incoming,
                results: mergedResults,
              };
            },
          },
          interactionActivities: {
            keyArgs: ["filters", "workspaceId"], 
            merge(existing, incoming, { args }) {
              const offset = args?.offset ?? 0;
              
              // Create a fresh array from existing results (if any)
              const mergedResults = existing ? [...existing.results] : [];

              // Place the incoming results exactly where they belong in the list
              // This supports both "Load More" and "Jump to Page"
              for (let i = 0; i < incoming.results.length; ++i) {
                mergedResults[offset + i] = incoming.results[i];
              }

              return {
                ...incoming,
                results: mergedResults,
              };
            },
          },
          interactions: {
            keyArgs: ["filters", "workspaceId", "offset", "limit"],
            merge(_, incoming) { return incoming; } // Simple replace for paged lists
          },
        },
      },
      InteractionActivity: {
        fields: {
          isOptimistic: {
            // If the field isn't in the cache, default it to false
            read(existing = false) {
              return existing;
            },
          },
        },
      },
      Identity: {
        fields: {
          // Force these to return null instead of undefined
          company: { read(existing) { return existing ?? null; } },
          avatarUrl: { read(existing) { return existing ?? null; } },
        }
      },
      Interaction: {
        fields: {
          notifications: {
            // This tells Apollo: "If it's missing, just return an empty array"
            read(existing = []) { return existing; },
            // Don't try to merge it into the database permanently
            merge: false, 
          },
          activities: {
            read(existing = []) { return existing; },
            // Don't try to merge it into the database permanently
            merge: false, 
          },
          permittedActions: {
            read(_, { readField }) {
              // 1. Get the current status from the cache
              const status = readField('status') as InteractionState;
              readField('_roleDependency');

              // 2. Get the current role from our Reactive Var
              const currentRole = activeRoleVar(); 

              // 3. Re-calculate
              return getPermittedActions(status, currentRole);
            },
            merge: false,
          },
        },
      },
    },
  }),
});