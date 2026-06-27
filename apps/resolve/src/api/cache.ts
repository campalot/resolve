import { makeVar } from "@apollo/client";

// Basic roles
export type Role = 'Admin' | 'Editor' | 'Viewer';

/**
 * This is our 'Global Knob' for the demo.
 * When this changes, any UI or Backend logic listening to it 
 * will react instantly.
 */
export const activeRoleVar = makeVar<Role>('Admin');

export const isSyncingVar = makeVar(false);