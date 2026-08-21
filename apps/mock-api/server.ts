import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { identityService, interactionService, interactionsListService, activitiesService, searchService } from '@resolve/domain';
import { getMockDb, configureStorage, persistDb, initializeMockDb, resetMockDb } from '@resolve/mock-db';
import { NodeStorage } from "@resolve/mock-db/node";
import mercurius from 'mercurius'; // Import the official package
import { schema } from './src/graphql'; 
import type { CreateFormProps, InteractionAction } from '@resolve/types';

const fs = import('fs/promises');

type WorkspaceParams = {
  workspaceId: string;
};

type ActivitiesQuery = {
  offset?: string;
  limit?: string;
  interactionId?: string;
};

type IdentitiesQuery = {
    offset?: string;
    limit?: string;
    sortBy: string;
    interactionId?: string;
    role?: string;
    type?: string[];
    status?: string[];
    identityId?: string;
    companyId?: string;
    searchText?: string;
};

type InteractionsQuery = {
    offset?: string;
    limit?: string;
    sortBy: string;
    interactionId?: string;
    role?: string;
    type?: string[];
    status?: string[];
    parties?: string[];
    identityId?: string;
    endDate?: string;
    startDate?: string;
    searchText?: string;
};

type SearchQuery = {
  offset?: string;
  limit?: string;
  q?: string;
};

type TransitionMutation = { 
    Params: WorkspaceParams & { id: string }; 
    Body: { 
        action: InteractionAction, 
        actorId: string, 
        comment?: string 
    }; 
}



async function start() {

    configureStorage(NodeStorage);
    await initializeMockDb();

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const fastify = Fastify({ logger: true });

    const sharedAssetsPath = path.resolve(
    __dirname, 
    'public/images/avatars/'
    );

    fastify.register(fastifyStatic, {
        root: sharedAssetsPath,
        prefix: '/images/avatars/', // Matches the URL other apps use
    });

    // Register CORS so different frontend ports can hit this API
    fastify.register(fastifyCors, {
    origin: (origin, cb) => {
        // Allow all local dev origins (e.g., http://localhost:3000, http://localhost:4000)
        cb(null, true); 
    }
    });


    // Register mercurius to mount the /graphql endpoint
    fastify.register(mercurius, {
        schema,
        path: '/graphql',
        graphiql: true // Access web playground UI at http://localhost:3001/graphiql
    });

    fastify.post('/api/dev/reset', async (request, reply) => {
        try {
            NodeStorage.clear();
            resetMockDb();
            await initializeMockDb();
            return reply.code(201).send({
            success: true,
            });
        } catch (error) {
            // Log the error and return a 500 status
            request.log.error(error);
            return reply.code(500).send({ error: 'Failed to reset the demo' });
        }
    });

    // Endpoint to simulate setting data (simulating localStorage write)
    fastify.post<TransitionMutation>('/api/w/:workspaceId/interactions/:id/transition', async (request, reply) => {
        const { workspaceId, id } = request.params;
        const { action, actorId, comment } = request.body;
        try {
        // Call your persistence service
        const result = await interactionService.executeTransition({
          workspaceId,
          id,
          action,
          actorId,
          comment
        });

        // Return a 201 Created status code with the payload
        // return reply.code(201).send({
        //   success: true,
        //   data: { transitionInteraction: result }
        // });
        return { transitionInteraction: result };
      } catch (error) {
        // Log the error and return a 500 status
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to process and persist data' });
      }
    });

    fastify.get('/api/workspaces', async () => {
        return { 
            workspaces: getMockDb().workspaces 
        };
    }),

    fastify.get<{ Params: WorkspaceParams; Querystring: ActivitiesQuery; }>("/api/w/:workspaceId/activities", async (request) => {

        const vars = {
            workspaceId: request.params.workspaceId,
            offset: parseInt(request.query.offset || '0'),
            limit: parseInt(request.query.limit || '20'),
            filters: {
                interactionId: request.query.interactionId,
            },
        };

        const data = await activitiesService.processActivities(getMockDb().interactionActivities, vars);

        return { interactionActivities: data };

    }),

    fastify.get<{ Params: WorkspaceParams; Querystring: IdentitiesQuery; }>(
        "/api/w/:workspaceId/identities",
        async (request) => {
            const role = request.query.role;

            const vars = {
                workspaceId: request.params.workspaceId,
                sortBy: request.query.sortBy,
                offset: parseInt(request.query.offset || '0'),
                limit: parseInt(request.query.limit || '12'),
                filters: {
                    type: Array.isArray(request.query.type) || !request.query.type ? request.query.type : [request.query.type],
                    status: Array.isArray(request.query.status) || !request.query.status ? request.query.status : [request.query.status],
                    identityId:request.query.identityId,
                    companyId: request.query.companyId,
                    searchText: request.query.searchText,
                },
            };
            

            return identityService.processIdentities(
                getMockDb().identities,
                vars
            );

        }
    );


    fastify.get<{ Params: WorkspaceParams; Querystring: InteractionsQuery; }>(
        "/api/w/:workspaceId/interactions",
        async (request) => {
            const role = request.query.role;

            const vars = {
                workspaceId: request.params.workspaceId,
                sortBy: request.query.sortBy,
                offset: parseInt(request.query.offset || '0'),
                limit: parseInt(request.query.limit || '12'),
                filters: {
                    type: Array.isArray(request.query.type) || !request.query.type ? request.query.type : [request.query.type],
                    status: Array.isArray(request.query.status) || !request.query.status ? request.query.status : [request.query.status],
                    parties: Array.isArray(request.query.parties) || !request.query.parties ? request.query.parties : [request.query.parties],
                    identityId:request.query.identityId,
                    startDate: request.query.startDate,
                    endDate: request.query.endDate,
                    searchQuery: request.query.searchText,
                },
            };
            

            return interactionsListService.processInteractions(
                getMockDb().interactions,
                vars
            );

        }
    );

    fastify.get<{ Params: WorkspaceParams; }>('/api/w/:workspaceId/reference/interactions', async (request) => {
      const workspaceId = request.params.workspaceId;

      const data = await interactionsListService.processReferenceData(
        getMockDb().interactions, 
        workspaceId
      );

      return data;
    }),

    fastify.get<{ Params: WorkspaceParams & { identityId: string }; }>('/api/w/:workspaceId/identities/:identityId', async (request) => {
        const workspaceId = request.params.workspaceId;
        const identityId = request.params.identityId;
        const data = await identityService.processProfile(
            workspaceId, 
            identityId
        );

        // if (!data) {
        //     return new HttpResponse(null, { status: 404 });
        // }

        return data;
    }),

    fastify.get<{ Params: WorkspaceParams & { interactionId: string }; }>('/api/w/:workspaceId/interactions/:interactionId', async (request) => {
        const workspaceId = request.params.workspaceId;
        const interactionId = request.params.interactionId;

        const data = await interactionService.getInteraction(
            workspaceId, 
            interactionId
        );

        return { interaction: data };
    }),

    fastify.post<{ Params: WorkspaceParams; Body: CreateFormProps; }>(
        "/api/w/:workspaceId/interactions/new/policy-update",
        async (request) => {
            const workspaceId = request.params.workspaceId;
            const db = getMockDb();
            const identities = db.identities;
            const { newInteraction, newActivities } = await interactionService.generateNewInteraction(workspaceId, identities, request.body);

            db.interactions.push(newInteraction);
            db.interactionActivities.unshift(...newActivities);
            persistDb(db);
            return { newInteraction, newActivities };
            // Simulate API submission or Server Action
            // await new Promise((resolve) => setTimeout(resolve, 1000));
            // alert("Policy update generated successfully!");

        }
    );

    fastify.post<{ Params: WorkspaceParams; Body: CreateFormProps; }>(
        "/api/w/:workspaceId/interactions/new/vendor-onboarding",
        async (request) => {
            const workspaceId = request.params.workspaceId;
            const db = getMockDb();
            const identities = db.identities;
            const { newInteraction, newActivities } = await interactionService.generateNewInteraction(workspaceId, identities, request.body);

            db.interactions.push(newInteraction);
            db.interactionActivities.unshift(...newActivities);
            persistDb(db);
            return { newInteraction, newActivities };

        }
    );

    fastify.post<{ Params: WorkspaceParams; Body: CreateFormProps; }>(
        "/api/w/:workspaceId/interactions/new/contract",
        async (request) => {
            const workspaceId = request.params.workspaceId;
            const db = getMockDb();
            const identities = db.identities;
            const { newInteraction, newActivities } = await interactionService.generateNewInteraction(workspaceId, identities, request.body);

            db.interactions.push(newInteraction);
            db.interactionActivities.unshift(...newActivities);
            persistDb(db);
            return { newInteraction, newActivities };

        }
    );

    fastify.post<{ Params: WorkspaceParams; Body: CreateFormProps; }>(
        "/api/w/:workspaceId/interactions/new/proposal",
        async (request) => {
            const workspaceId = request.params.workspaceId;
            const db = getMockDb();
            const identities = db.identities;
            const { newInteraction, newActivities } = await interactionService.generateNewInteraction(workspaceId, identities, request.body);

            db.interactions.push(newInteraction);
            db.interactionActivities.unshift(...newActivities);
            persistDb(db);
            return { newInteraction, newActivities };

        }
    );

    fastify.get<{ Params: WorkspaceParams; Querystring: SearchQuery; }>('/api/w/:workspaceId/search', async (request) => {

        // Extract variables from REST URL
        const vars = {
            workspaceId: request.params.workspaceId,
            queryString: request.query.q || '',
            //queryString: request.query.queryString || '',
            offset: parseInt(request.query.offset || '0'),
            limit: parseInt(request.query.limit || '10'),
        };
        
        const data = await searchService.processSearchResults(
            getMockDb().interactions, 
            getMockDb().identities, 
            vars,
        );

        return { search: data };
    }),

    fastify.listen({ port: 3001 }, (err) => {
        if (err) throw err;
        console.log('Mock API running on http://localhost:3001');
     });




// Run the server!
// try {
//   await fastify.listen({ port: 3001 })
//   console.log('Mock API running on http://localhost:3001');
// } catch (err) {
//   fastify.log.error(err)
//   process.exit(1)
// }

}

start().catch(err => {
    console.error(err);
    process.exit(1);
});