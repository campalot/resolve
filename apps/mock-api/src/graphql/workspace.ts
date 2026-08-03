// apps/mock-api/src/graphql/workspace.ts
import { builder } from './builder';
import { getMockDb } from '@resolve/mock-db';

// 1. Define the Workspace object ref
export const WorkspaceType = builder.objectRef('Workspace').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
  }),
});

// 2. Inject the workspaces endpoint directly into the global root Query container
builder.queryFields((t) => ({
  workspaces: t.field({
    type: [WorkspaceType],
    resolve: async () => {
      return getMockDb().workspaces;
    },
  }),
}));
