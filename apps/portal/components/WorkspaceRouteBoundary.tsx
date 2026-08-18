"use client";

import { useWorkspaces } from "@/hooks/useWorkspaces";
import { WorkspaceProvider } from "@/contexts/Workspace/WorkspaceProvider";
import type { Workspace } from "@resolve/types";
import styles from "@/components/Header/Header.module.scss";

type WorkspaceBoundaryProps = {
  workspaceId: string;
  children: React.ReactNode;
};

export function WorkspaceBoundary({
  workspaceId,
  children,
}: WorkspaceBoundaryProps) {
  const { workspaces, loading } = useWorkspaces({
    enabled: true,
  });

  const workspace =
    workspaces.find((w: Workspace) => w.id === workspaceId) ?? workspaces[0];

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
    <WorkspaceProvider workspace={workspace}>{children}</WorkspaceProvider>
  );
}
