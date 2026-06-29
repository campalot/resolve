import React from "react";
import { Link } from "react-router-dom";
import Avatar from "../../components/Avatars/Avatar";
import type {
  Identity,
  Interaction,
  InteractionActivity,
  InteractionActivityMetadata_Reviewer,
} from "@resolve/types";
import { useWorkspace } from "../../contexts/Workspace/WorkspaceContext";
import { useWorkspacePath } from "../../hooks/useWorkspacePath";
import { identityRoute } from "../../routes/routes";
import styles from "./Profile.module.scss";

type ProfileHeaderProps = {
  identity: Identity;
  interactions: Interaction[];
  activities: InteractionActivity[];
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  identity,
  interactions,
  activities,
}) => {
  const workspace = useWorkspace();
  const workspacePath = useWorkspacePath();
  const total = interactions.length;
  const decidedCount = interactions.filter(
    (i) => i.status === "APPROVED" || i.status === "REJECTED",
  ).length;
  const openCount = total - decidedCount;
  const reviewerActivities = activities.filter((activity) => activity.metadata.__typename === "InteractionActivityMetadata_Reviewer");
  const awaitingAction = reviewerActivities.filter((activity) => (activity.metadata as InteractionActivityMetadata_Reviewer).nextReviewer.identity.id === identity.id).length;
  return (
    <header
      className={`${styles.profileHeader} ${identity?.type === "Company" ? styles.companyHeader : styles.personHeader}`}
    >
      <div className={styles.profileHeaderContent}>
        <Avatar
          identity={identity}
          size={100}
          isSquare={identity.type === "Company"}
        />
        <div>
          <h1 className={styles.profileName}>{identity.name}</h1>
          {identity?.company && (
            <Link to={workspacePath(identityRoute(identity.company?.id))} className={styles.profileSubline}>
              {identity.company?.name}
            </Link>
          )}
          <p className={styles.profileWorkspace}>Member of {workspace.name} Workspace</p>
        </div>
      </div>
      <div className={styles.profileHeaderStats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{total}</span>
          <span className={styles.statLabel}>Interactions</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{openCount}</span>
          <span className={styles.statLabel}>Open</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{decidedCount}</span>
          <span className={styles.statLabel}>Decided</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{awaitingAction}</span>
          <span className={styles.statLabel}>Awaiting Action</span>
        </div>
      </div>
    </header>
  );
};
