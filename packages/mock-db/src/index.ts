export * from "./storage";
// Keep existing component/factory exports intact if the frontend uses them
export * from "./mockActivities";
export * from "./mockInteractions";
// IF THE SERVER USES THIS INDEX FILE TO IMPORT BACKEND CODES:
// We use a safe conditional or separate exports. But to keep the server compiling,
// we can keep these here *provided* we fix Vite's bundler config next.
export { 
  forceResetWorkspaceShard,
  forceResetAllSessionShards,
  getMockDb, 
  generateWorkspaceData,
  persistDb, 
  resetMockDb,
  runAgnosticDatabaseHydration,
  clearRequestScopedCache,
} from "./mockDB";
