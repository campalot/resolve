import { useLocation, matchPath } from "react-router-dom";
import { InteractionsSkeleton } from "./Interactions/InteractionsSkeleton";
import { IdentitiesSkeleton } from "./Identities/IdentitiesSkeleton";
import { DashboardSkeleton } from "./Dashboard/DashboardSkeleton";
import { InteractionDetailSkeleton } from "./InteractionDetail/InteractionDetailSkeleton";
import { ProfileSkeleton } from "./Profile/ProfileSkeleton";

export const LoadingScreen = () => {
  const { pathname } = useLocation();

  // Detail page (more specific)
  if (
    matchPath("/w/:workspaceId/interactions/:interactionId/:tabId", pathname) ||
    matchPath("/w/:workspaceId/interactions/:interactionId", pathname)
  ) {
    return <InteractionDetailSkeleton />;
  }

  // Profile page
  if (matchPath("/w/:workspaceId/identities/:identityId", pathname)) {
    return <ProfileSkeleton />;
  }

  // List page
  if (matchPath("/w/:workspaceId/interactions", pathname)) {
    return <InteractionsSkeleton />;
  }

  if (matchPath("/w/:workspaceId/people", pathname)) {
    return <IdentitiesSkeleton />;
  }

  if (matchPath("/w/:workspaceId/dashboard", pathname)) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="loading-screen">
      <p>Simulating API...</p>
    </div>
  );
};
