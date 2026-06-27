import { useEffect } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { WorkspaceProvider } from "../contexts/Workspace/WorkspaceProvider";
import { useWorkspacesList } from "../hooks/useWorkspacesList";
import { LoadingScreen } from "../pages/LoadingScreen";
import { SimpleShellLayout } from "../layouts/SimpleShellLayout";
import type { Workspace } from "../types/schema";
import { useAppStore } from "../store/useAppStore";
import { DEFAULT_WORKSPACE_ID } from "./AppRoutes";

export function WorkspaceRouteBoundary() {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const persistedWorkspace = useAppStore((s) => s.activeWorkspace);
  const setPersistedWorkspace = useAppStore((s) => s.setActiveWorkspace);

  const { workspaces, loading } = useWorkspacesList();

  // 1. Derive workspace from fresh data first
  const freshWorkspace =
    workspaces?.find((w: Workspace) => w.id === workspaceId) ?? workspaces?.[0];

  // 2. Sync to Zustand when fresh data arrives
  useEffect(() => {
    if (freshWorkspace) {
      setPersistedWorkspace(freshWorkspace);
    }
  }, [freshWorkspace, setPersistedWorkspace]);

  // 3. Compute active workspace (fresh > persisted)
  const activeWorkspace = freshWorkspace ?? persistedWorkspace;

  // 4. Loading state (only when we truly have nothing)
  if (loading && !activeWorkspace) {
    return (
      <SimpleShellLayout>
        <LoadingScreen />
      </SimpleShellLayout>
    );
  }

  // 5. Redirect if URL doesn't match resolved workspace
  if (activeWorkspace && activeWorkspace.id !== workspaceId) {
    return <Navigate to={`/w/${activeWorkspace.id}/dashboard`} replace />;
  }

  // 6. Final fallback (extremely rare)
  if (!activeWorkspace && !loading) {
    return <Navigate to={`/w/${DEFAULT_WORKSPACE_ID}/dashboard`} replace />;
  }

  // 7. Render
  return (
    <WorkspaceProvider workspace={activeWorkspace}>
      <Outlet />
    </WorkspaceProvider>
  );
}
