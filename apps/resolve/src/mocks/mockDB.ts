import { generateActivities } from "./mockActivities";
import { generateInteractions } from "./mockInteractions";
import { generateIdentities } from "./mockIdentities";
import { generateWorkspaces } from "./mockWorkspaces";
import type { IdentityRecord } from "../types/api";
import type { InteractionActivityRecord } from "../types/api";
import type { InteractionRecord } from "../types/api";
import type { Workspace } from "../types/schema";
import { throttle } from "lodash";
import { useAppStore } from "../store/useAppStore";

let instance: MockDbProps | null = null;
const STORAGE_KEY = 'RESOLVE_DEMO_DB';

type MockDbProps = {
  identities: IdentityRecord[];
  interactions: InteractionRecord[];
  interactionActivities: InteractionActivityRecord[];
  workspaces: Workspace[];
}

function generateWorkspaceData(workspaceId: string) {
  const identities = generateIdentities(workspaceId);
  const interactions = generateInteractions(workspaceId, identities);
  const activities = generateActivities(workspaceId, interactions, identities);

  return { identities, interactions, activities };
}

/**
 * Factory function — generates a fresh DB
 */
function generateMockDb(): MockDbProps {
  const workspaces = generateWorkspaces();
  const workspaceData = workspaces.map((w) =>
    generateWorkspaceData(w.id)
  );

  return {
    identities: workspaceData.flatMap((d) => d.identities),
    interactions: workspaceData.flatMap((d) => d.interactions),
    interactionActivities: workspaceData.flatMap((d) => d.activities),
    workspaces, // not part of workspaceData
  };
}

/**
 * Module-scoped mutable instance
 */
const db: MockDbProps = generateMockDb();

/**
 * Getter used everywhere instead of importing object directly
 */
export const getMockDb = () => {
  // If we already loaded it, don't do anything else
  if (instance) return instance;

  // The "Load-on-Boot" check
  const savedData = localStorage.getItem(STORAGE_KEY);
  
  if (savedData) {
    try {
      // Try to turn the string back into our DB object
      instance = JSON.parse(savedData);
      console.log("📂 [DB] Hydrated from LocalStorage");
    } catch (e) {
      // If the JSON is garbled, we reset to be safe
      console.error("❌ [DB] Stored data corrupted, resetting...", e);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // 4. If there was no saved data, use the original "Factory" logic
  if (!instance) {
    instance = db;
    // Save this specific random generation so the user sees 
    // the same IDs and Names if they refresh before mutating.
    persistDb(instance); 
    console.log("✨ [DB] Initialized with gnerated mock records");
  }

  return instance;
};

/**
 * Used in tests to reset state
 */
export function resetMockDb(): void {
  //db = generateMockDb();

  instance = null; // This is the key. It clears the "Singleton"
  // Clear localStorage so it doesn't hydrate the old data
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const persistDb = throttle((data: MockDbProps) => {
  useAppStore.getState().setSyncing(true);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Small delay so the user actually sees the "Sync" happen
    setTimeout(() => useAppStore.getState().setSyncing(false), 500); 
    console.log("💾 [DB] Successfully saved to LocalStorage");
  } catch (e) {
    useAppStore.getState().setSyncing(false);
    console.error("❌ [DB] Persistence failed", e);
  }
}, 1000, { leading: false, trailing: true });


