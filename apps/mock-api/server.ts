import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import fastifyCookie from '@fastify/cookie';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
    identityService, 
    interactionService, 
    interactionsListService, 
    activitiesService, 
    searchService 
} from '@resolve/domain';
import { 
    runAgnosticDatabaseHydration, 
    clearRequestScopedCache, 
    getMockDb, 
    configureStorage, 
    persistDb,
    forceResetWorkspaceShard,
    forceResetAllSessionShards
} from '@resolve/mock-db';
import { NodeStorage } from "@resolve/mock-db/node";
import { UpstashRedisStorage } from '@resolve/mock-db/redis';
import { TestStorage } from 'packages/mock-db/src/storage/TestStorage';
import mercurius from 'mercurius';
import { schema } from './src/graphql'; 
import type { CreateFormProps, InteractionAction } from '@resolve/types';
// import { getStorage } from '@resolve/mock-db';

const fs = import('fs/promises');

// Augment the FastifyRequest interface to include custom property
declare module 'fastify' {
  interface FastifyRequest {
    sessionContext: {
      sessionId: string;
      currentWorkspaceId?: string;
    };
  }
}

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

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

async function start() {
    // 1. Detect if running inside a Vitest runner block
    const isTesting = typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.VITEST;
    // 2. Only use real Upstash if we are NOT in a test and credentials exist
    const useRealUpstash = 
        !isTesting && 
        process.env.UPSTASH_REDIS_REST_URL && 
        process.env.UPSTASH_REDIS_REST_TOKEN;

    // Configure the storage engine accordingly
    configureStorage(useRealUpstash ? UpstashRedisStorage : NodeStorage);

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const fastify = Fastify({ logger: true });

    fastify.register(fastifyCookie);

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
        },
        //     origin: [
        //         'http://localhost:5173', // React SPA
        //         'http://localhost:3000'  // Next.js Portal
        //     ],
        credentials: true, // Crucial: Allows browsers to send/receive cookies
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    });

    /**
     * 📡 GLOBAL INBOUND REQUEST GATEWAY & HYDRATION HOOK
     * 
     * Intercepts every inbound HTTP request after URL parameters are fully parsed.
     * This hook manages the following core stateless architectural lifecycle steps:
     * 
     * 1. SESSION MANAGEMENT: Captures or provisions a unique browser cookie passport string.
     * 2. PARAMETER RESOLUTION: Safely extracts active workspace context targets across standard paths.
     * 3. RE-WARMING THE CACHE: Dynamically hydrates the request-scoped database registry array block 
     *    straight out of the active storage driver strategy (Upstash Redis or File System) before 
     *    downstream domain handlers, REST routes, or GraphQL fields can run blind.
     */
    fastify.addHook('preHandler', async (request, reply) => {
        // 1. Sniff out the test header sent by your Axios test suite interceptor
        const isTestRequest = request.headers['x-resolve-test-context'] === 'true';
        let sessionId = request.cookies['demo-session'];
        
        // 2. DYNAMIC ADAPTER SWAP: If this request is from Vitest, hot-swap the adapter
        if (isTestRequest) {
            configureStorage(TestStorage);
            // Force tests into an isolated test session identifier passed by Axios
            sessionId = (request.headers['x-resolve-session-id'] as string) || 'demo-session-test-automation-passport';
        } else {
            // Standard application mode: restore the standard persistent storage strategy
            const useRealUpstash = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
            configureStorage(useRealUpstash ? UpstashRedisStorage : NodeStorage);
        }

        
        // let sessionId = request.cookies['demo-session'];
        let isNewSession = false;

        if (!sessionId) {
        sessionId = crypto.randomUUID();
        isNewSession = true;
        }

        //if (isNewSession) {
        if (isNewSession && !isTestRequest) { // Avoid setting browser cookies during automated node tests
        reply.setCookie('demo-session', sessionId, {
            path: '/',
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 60 * 60 * 24
        });
        }

        // 1. Cast parameters loosely to read 'workspaceId' if it exists on any route structure
        const params = request.params as Record<string, unknown>;
        const body = request.body as Record<string, unknown> | null;

        const workspaceId = (params?.workspaceId as string | undefined) || (body?.workspaceId as string | undefined);

        // Set the context data early
        request.sessionContext = { sessionId, currentWorkspaceId: workspaceId };

        // Skip cloud data downloads if executing a database cleanup reset operation
        if (request.routeOptions.url?.includes('/dev/reset')) {
            return;
        }

        // Load targeted workspace shard straight into safe memory cache
        await runAgnosticDatabaseHydration(sessionId, workspaceId);
    });

    /**
     * 🧹 OUTBOUND MEMORY CLEANER
     * Completely purges the global memory cache reference the moment the 
     * response clears out, guaranteeing zero session contamination across requests.
     */
    fastify.addHook('onResponse', async (request, reply) => {
        clearRequestScopedCache();
    });

    // Register mercurius to mount the /graphql endpoint
    fastify.register(mercurius, {
        schema,
        path: '/graphql',
        graphiql: true, // Access web playground UI at http://localhost:3001/graphiql
        // Crucial: Hydrate the session details into the execution context for resolvers
        context: async (request) => {
        // Always pull the browser cookie session passport
        // const sessionId = request.cookies['demo-session'] || 'default-fallback-session';
        const isTestRequest = request.headers['x-resolve-test-context'] === 'true';
        let sessionId = request.cookies['demo-session'] || 'default-fallback-session';

        if (isTestRequest) {
        // Hot swap to memory for GraphQL operations during testing
        configureStorage(TestStorage);
        sessionId = (request.headers['x-resolve-session-id'] as string) || 'demo-session-test-automation-passport';
        } else {
        const useRealUpstash = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
        configureStorage(useRealUpstash ? UpstashRedisStorage : NodeStorage);
        }

        // Extract workspace from headers or query string (depending on how GQL client sends it)
        const workspaceId = 
            (request.headers['x-workspace-id'] as string) || 
            (request.query as any)?.workspaceId ||
            'workspaces'; // fallback to menu metadata if none provided

        // Hydrate the Upstash Redis data shard right here before the resolver executes!
        await runAgnosticDatabaseHydration(sessionId, workspaceId);

        return {
            sessionContext: {
            sessionId,
            currentWorkspaceId: workspaceId
            }
        };
        }
    });

    // RESETS ONE WORKSPACE DATA - Updated path includes :workspaceId
    fastify.post<{ Params: WorkspaceParams }>('/api/w/:workspaceId/dev/reset', async (request, reply) => {
    try {
        // Pull the session and workspace values securely from the request context
        const { sessionId, currentWorkspaceId } = request.sessionContext;

        if (!currentWorkspaceId) {
            return reply.code(400).send({ error: 'Missing active workspace configuration context' });
        }

        forceResetWorkspaceShard(sessionId, currentWorkspaceId);

        console.log(`🧹 [DB] Reset data shard for workspace [${currentWorkspaceId}] in session ${sessionId}`);
        return reply.code(201).send({ success: true });

    } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to reset the workspace environment' });
    }
    });

    // RESETS ALL DATA
    fastify.post('/api/dev/reset', async (request, reply) => {
        try {
            const { sessionId } = request.sessionContext;
            forceResetAllSessionShards(sessionId);
            return reply.code(201).send({ success: true });
        } catch (error) {
            // Log the error and return a 500 status
            request.log.error(error);
            return reply.code(500).send({ error: 'Failed to reset the demo' });
        }
    });

    fastify.post<TransitionMutation>('/api/w/:workspaceId/interactions/:id/transition', async (request, reply) => {
        const { workspaceId, id } = request.params;
        const { action, actorId, comment } = request.body;

        try {
            // 1. Grab the database instance that was already hydrated perfectly by your preHandler hook
            const db = getMockDb();

            // 2. Call your shared business rules service logic
            const result = await interactionService.executeTransition({ 
                workspaceId, 
                id, 
                action, 
                actorId, 
                comment,
                db 
            });

            // 3. Nest inside the wrapper key to satisfy frontend TanStack Mutation success triggers
            return { transitionInteraction: result };

        } catch (error) {
            console.log("💥 [REST Transition Error Details]:");
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

    fastify.get<{ Params: WorkspaceParams; Querystring: InteractionsQuery; }>(
        "/api/w/:workspaceId/interactions/dashboard",
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
            

            return interactionsListService.processDashboardInteractions(
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

}

start().catch(err => {
    console.error(err);
    process.exit(1);
});