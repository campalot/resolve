import { builder } from './builder';
import { getMockDb } from '@resolve/mock-db';
import { Workspace } from '@resolve/types';
import { runAgnosticDatabaseHydration } from '@resolve/mock-db';

// Define the Workspace object ref
export const WorkspaceType = builder.objectRef<Workspace>('Workspace').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
  }),
});

// Inject the workspaces endpoint directly into the global root Query container
builder.queryFields((t) => ({
  workspaces: t.field({
    type: [WorkspaceType],
    // Grab 'context' as the third argument in the resolver signature
    resolve: async (_root, _args, context) => {
      // Extract your secure session passport parameters
      const { sessionId } = context.sessionContext;

      // Hydrate the root workspaces array from Upstash Redis
      await runAgnosticDatabaseHydration(sessionId);

      // Return the stitched workspaces array parameter-free
      return getMockDb().workspaces;
    },
  }),
}));
