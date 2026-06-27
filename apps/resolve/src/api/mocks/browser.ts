import { setupWorker } from 'msw/browser';
import { identityHandlers } from './features/identityHandlers';
import { workspacesHandlers } from './features/workspacesHandlers';
import { transitionHandlers } from './features/transitionhandlers';
import { interactionHandlers } from './features/interactionHandlers';
import { activityHandlers } from './features/activityHandlers';
import { interactionsListHandlers } from './features/interactionsListHandlers';
import { profileHandlers } from './features/profileHandlers';
import { referenceDataHandlers } from './features/referenceDataHandlers';
import { searchHandlers } from './features/searchHandlers';

export const worker = setupWorker(
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
