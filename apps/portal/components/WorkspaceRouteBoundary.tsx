"use client";

import { useState } from "react";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { WorkspaceProvider } from "@/contexts/Workspace/WorkspaceProvider";
import type { Workspace } from "@resolve/types";
import { useCurrentUser } from "@/contexts/CurrentUser/CurrentUserContext";
import styles from "@/components/Header/Header.module.scss";

type WorkspaceBoundaryProps = {
  workspaceId: string;
  children: React.ReactNode;
};

export function WorkspaceBoundary({
  workspaceId: wsId,
  children,
}: WorkspaceBoundaryProps) {
  const [workspace, setWorkspace] = useState({
    "id": "alpha",
    "name": "Alpha"
  });
  const { selectCurrentUser } = useCurrentUser();
  const { workspaces, loading } = useWorkspaces({
    enabled: true,
  });

  const handleWorkspaceChange = (workspaceId: string) => {
    selectCurrentUser(null);
    const ws =
      workspaces.find((w: Workspace) => w.id === (workspaceId || wsId)) ??
      workspaces[0];
    setWorkspace(ws);
    
  };

  if (loading && !workspace) {
    return (
      <>
        <header className={styles.header} style={{ background: "#e8e8e8" }}>
          <div className={styles.left}>
            on
            <span className={styles.productName}>Resolve</span>
          </div>
        </header>
        <div style={{ margin: "32px" }}>Loading...</div>
      </>
    );
  }

  if (!workspace) {
    throw new Error("Workspace not found.");
  }

  return (
    <WorkspaceProvider
      workspace={workspace}
      selectWorkspace={handleWorkspaceChange}
    >
      {children}
    </WorkspaceProvider>
  );
}
