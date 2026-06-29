import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Workspace } from '@resolve/types';

type Role = 'Admin' | 'Editor' | 'Viewer';
export type DataStrategy = 'APOLLO' | 'TANSTACK';
export type ErrorType = 'app' | 'content';

interface AppState {
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  activeRole: Role;
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => void;
  isSyncing: boolean;
  setRole: (role: Role) => void;
  setSyncing: (bool: boolean) => void;
  dataStrategy: DataStrategy;
  setDataStrategy: (strategy: DataStrategy) => void;
  latency: number;
  setLatency: (ms: number) => void;
  forceError: ErrorType | null;
  setForceError: (type: ErrorType | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      activeRole: 'Admin' as Role,
      activeWorkspace: null,
      setActiveWorkspace: (workspace: Workspace) => set({ activeWorkspace: workspace }),
      isSyncing: false,
      setRole: (role) => {
        // Update the Zustand world (triggers your React hooks)
        set({ activeRole: role });
      },
      setSyncing: (bool) => set({ isSyncing: bool }),
      dataStrategy: (localStorage.getItem('DATA_STRATEGY') as DataStrategy) || 'TANSTACK',
      setDataStrategy: (strategy) => {
        localStorage.setItem('DATA_STRATEGY', strategy);
        // Force a reload to ensure caches are purged and MSW re-binds
        window.location.reload(); 
      },
      latency: Number(localStorage.getItem('DEV_LATENCY')) || 0,
      setLatency: (ms) => {
        localStorage.setItem('DEV_LATENCY', ms.toString());
        set({ latency: ms });
      },
      forceError: null, // Don't persist this; we want a fresh start on reload
      setForceError: (type: ErrorType | null) => set({ forceError: type }),
    }),
    {
      name: 'app-storage', // key in localStorage
      onRehydrateStorage: (state) => {
        // This runs when hydration starts
        return () => {
          // This runs when hydration finishes
          state.setHasHydrated(true);
        };
      },
      partialize: (state) => ({ 
        activeRole: state.activeRole, 
        activeWorkspace: state.activeWorkspace,
      }),
    },
  )
);