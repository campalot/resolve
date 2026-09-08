import React from "react";
import { useWorkspace, useWorkspaceActions } from "@/contexts/Workspace/WorkspaceContext";
import styles from "./DevOverlay.module.scss";

export const DevOverlay: React.FC = () => {
  const workspace = useWorkspace();
  const setWorkspace = useWorkspaceActions();

  const handleWorkspaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setWorkspace(e.target.value);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.tag}>DEV MODE</div>
      <div className={styles.content}>
        <label htmlFor="role-switcher">Change Workspace:</label>
        <select
          id="workspace-switcher"
          value={workspace.id}
          onChange={handleWorkspaceChange}
        >
          <option value="alpha">Alpha</option>
          <option value="beta">Beta</option>
          <option value="gamma">Gamma</option>
        </select>
      </div>
    </div>
  );
};
