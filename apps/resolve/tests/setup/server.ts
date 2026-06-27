import { setupServer } from 'msw/node';
import { identityHandlers } from '../../src/api/mocks/features/identityHandlers';
import { workspacesHandlers } from '../../src/api/mocks/features/workspacesHandlers';
import { transitionHandlers } from '../../src/api/mocks/features/transitionhandlers';
import { interactionHandlers } from '../../src/api/mocks/features/interactionHandlers';
import { activityHandlers } from '../../src/api/mocks/features/activityHandlers';
import { interactionsListHandlers } from '../../src/api/mocks/features/interactionsListHandlers';
import { profileHandlers } from '../../src/api/mocks/features/profileHandlers';
import { referenceDataHandlers } from '../../src/api/mocks/features/referenceDataHandlers';
import { searchHandlers } from '../../src/api/mocks/features/searchHandlers';

export const server = setupServer(
    ...workspacesHandlers, 
    ...identityHandlers, 
    ...transitionHandlers,
    ...interactionHandlers,
    ...activityHandlers,
    ...interactionsListHandlers,
    ...profileHandlers,
    ...referenceDataHandlers,
    ...searchHandlers,
);

server.events.on('request:start', ({ request }) => {
  console.log('MSW Intercepting:', request.method, request.url)
})
