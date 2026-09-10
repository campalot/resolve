import { generateActivities } from "./mockActivities";
import { generateInteractions } from "./mockInteractions";
import { generateIdentities } from "./mockIdentities";
import { generateWorkspaces } from "./mockWorkspaces";
import { getStorage } from "./storage";
import type { WorkspaceDataProps } from "@resolve/types";

/**
 * THE IN-MEMORY DATABASE FOR TESTING
 * A simple cache variable that holds the active user data block 
 * for the duration of a single unit/integration test.
 */
// let testInstance: MockDbProps | null = null;
// const isTest = import.meta.env.MODE === "test";

// let isTestContext = false;

// export const initializeMockConfig = (config: { isTest: boolean }) => {
//   isTestContext = config.isTest;
// };

/**
 * THE BROWSER-SAFE REQUEST REGISTRY
 * A simple short-lived cache variable that holds the active user data block 
 * for the duration of a single inbound HTTP request execution thread.
 */
let currentRequestContext: {
  sessionId: string;
  workspaceId: string;
  data: any;
} | null = null;

export function clearRequestScopedCache() {
  currentRequestContext = null;
}

export function generateWorkspaceData(workspaceId: string): WorkspaceDataProps {
  const identities = generateIdentities(workspaceId);
  const interactions = generateInteractions(workspaceId, identities);
  const interactionActivities = generateActivities(workspaceId, interactions, identities);
  return { identities, interactions, interactionActivities };
}

/**
 * 🎯 THE SYSTEM HYDRATION CORE (The Read-Lock):
 * Safely fetches dataset slices out of Upstash Redis. It will NEVER execute a 
 * generation factory or overwrite keys if data already exists in the cloud database.
 */
export async function runAgnosticDatabaseHydration(sessionId: string, workspaceId?: string): Promise<void> {
  const storage = getStorage();

  // 1. Maintain global workspace menus definitions
  let workspaces = await storage.loadWorkspace(sessionId, 'workspaces');
  if (!workspaces) {
    workspaces = generateWorkspaces();
    await storage.saveWorkspace(sessionId, 'workspaces', workspaces);
  }

  // 2. Global routing check fallback (like /api/workspaces)
  if (!workspaceId) {
    currentRequestContext = {
      sessionId,
      workspaceId: 'workspaces',
      data: { workspaces, identities: [], interactions: [], interactionActivities: [] }
    };
    return;
  }

  // 3. SECURE READ LOCK: Fetch whatever data currently exists inside the cloud instance
  let workspaceData = await storage.loadWorkspace(sessionId, workspaceId);

  // 4. THE SAFE GUARD: Only run the factory if the database key is completely missing
  if (!workspaceData || Object.keys(workspaceData).length === 0) {
    console.log(`✨ [DB] [Cold Start] Generating first-time random dataset for workspace [${workspaceId}]`);
    workspaceData = generateWorkspaceData(workspaceId);
    await storage.saveWorkspace(sessionId, workspaceId, workspaceData);
  } else {
    console.log(`📂 [DB] [Warm Hit] Successfully fetched persistent cloud records for workspace [${workspaceId}]`);
  }

  // 5. Securely cache the active payload scope for this request context
  currentRequestContext = {
    sessionId,
    workspaceId,
    data: {
      ...workspaceData,
      workspaces
    }
  };
}

/**
 * 🔄 THE NO-PARAMETER DATA GETTER:
 */
export function getMockDb() {
  if (!currentRequestContext) {
    throw new Error("❌ [DB] Attempted to read database outside of a hydrated request pipeline.");
  }
  return currentRequestContext.data;
}

/**
 * 💾 THE NO-PARAMETER DATA SAVER:
 * It uses the cached context  variables to figure
 * out exactly which Upstash key to overwrite.
 */
export async function persistDb(updatedWorkspaceData: any) {
  if (!currentRequestContext) {
    throw new Error("❌ [DB] Attempted to persist database outside of an active request context.");
  }

  const { sessionId, workspaceId } = currentRequestContext;
  const storage = getStorage();

  currentRequestContext.data = updatedWorkspaceData;
  
  // Flush mutations directly up to the configured storage key
  await storage.saveWorkspace(sessionId, workspaceId, updatedWorkspaceData);
}

/**
 * 🧹 EXPLICIT EXECUTOR TO RESET AND REGENERATE ONE WORKSPACE
 * Called directly by the /api/w/:workspaceId/dev/reset endpoint
 */
export async function forceResetWorkspaceShard(sessionId: string, workspaceId: string): Promise<void> {
  const storage = getStorage();
  
  if (storage.clearWorkspace) {
    await storage.clearWorkspace(sessionId, workspaceId);
    console.log(`🗑️ [DB] Evicted old keys from storage for workspace [${workspaceId}]`);
    
    const freshData = generateWorkspaceData(workspaceId);
    await storage.saveWorkspace(sessionId, workspaceId, freshData);
    console.log(`✨ [DB] Successfully regenerated random mock environment for workspace [${workspaceId}]`);
  }
}

/**
 * 💥 EXPLICIT EXECUTOR TO NUKE AND RESET EVERYTHING
 * Called directly by the global /api/dev/reset endpoint
 */
export async function forceResetAllSessionShards(sessionId: string): Promise<void> {
  const storage = getStorage();
  const targets = ['workspaces', 'alpha', 'beta', 'gamma'];

  if (storage.clearWorkspace) {
    for (const workspaceId of targets) {
      await storage.clearWorkspace(sessionId, workspaceId);
    }
    console.log(`💥 [DB] Complete session data purge completed in storage for session: ${sessionId}`);
  }
}

// --- BACKWARDS COMPATIBILITY EXPORTS ---
// Empty definitions strictly preserved to prevent breaking any legacy server build configuration files
export function resetMockDb() {
  // 1. Wipe out the global active request pointer so Test B cannot read Test A's data
  // clearRequestScopedCache(); 

  // const storage = getStorage();
  // if (storage.clearWorkspace) {
  //   storage.clearWorkspace("demo-session-test-automation-passport", "alpha");
  // }
}
