import React from "react";
import { useParams } from "react-router-dom";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileInteractions } from "./ProfileInteractions";
import { ProfileActivity } from "./ProfileActivity";
import { useProfile } from "../../hooks/useProfile";
import styles from "./Profile.module.scss";
import { ProfileSkeleton } from "./ProfileSkeleton";

export const Profile: React.FC = () => {
  const { identityId } = useParams<{
      identityId: string;
    }>();
  const { identity, interactions, activities, loading, error } = useProfile(identityId);
  
  if (loading) return <ProfileSkeleton />;

  if (error) return <div>Failed to load profile</div>;

  return (
    <div className={styles.profileContainer}>
      <ProfileHeader
        identity={identity}
        interactions={interactions}
        activities={activities}
      />
      <div className={styles.profileLayout}>
        <div className={styles.profileBodyLeft}>
          <ProfileInteractions interactions={interactions} />
        </div>
        <div className={styles.profileBodyRight}>
          <ProfileActivity activities={activities} />
        </div>
      </div>
    </div>
  );
};
