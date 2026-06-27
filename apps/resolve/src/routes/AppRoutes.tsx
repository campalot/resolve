import React, { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Keep these static as they define the shell/context of the app
import { AppLayout } from "../layouts/AppLayout";
import { WorkspaceRouteBoundary } from "./WorkspaceRouteBoundary";
import { InteractionsReferenceDataProvider } from "../contexts/InteractionReferenceData/InteractionsReferenceDataProvider";


// Lazy Load Named Exports
const Dashboard = lazy(() =>
  import("../pages/Dashboard/Dashboard").then((m) => ({
    default: m.Dashboard,
  })),
);
const Interactions = lazy(() =>
  import("../pages/Interactions/Interactions").then((m) => ({
    default: m.Interactions,
  })),
);
const InteractionDetail = lazy(() =>
  import("../pages/InteractionDetail/InteractionDetail").then((m) => ({
    default: m.InteractionDetail,
  })),
);
const Profile = lazy(() =>
  import("../pages/Profile/Profile").then((m) => ({ default: m.Profile })),
);
const Identities = lazy(() =>
  import("../pages/Identities/Identities").then((m) => ({
    default: m.Identities,
  })),
);
const MobileSearchPage = lazy(() =>
  import("../pages/Search/MobileSearchPage").then((m) => ({
    default: m.MobileSearchPage,
  })),
);
const NotFound = lazy(() =>
  import("../pages/NotFound").then((m) => ({ default: m.NotFound })),
);

export const DEFAULT_WORKSPACE_ID = "alpha";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to={`/w/${DEFAULT_WORKSPACE_ID}/dashboard`} replace />
        }
      />

      <Route path="/w/:workspaceId" element={<WorkspaceRouteBoundary />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="identities/:identityId" element={<Profile />} />
          <Route path="people" element={<Identities />} />

          <Route
            path="interactions"
            element={
              <InteractionsReferenceDataProvider>
                <Interactions />
              </InteractionsReferenceDataProvider>
            }
          />

          <Route
            path="interactions/:interactionId/:tabId?"
            element={<InteractionDetail />}
          />

          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="search" element={<MobileSearchPage />} />
      </Route>

      <Route
        path="*"
        element={
          <Navigate to={`/w/${DEFAULT_WORKSPACE_ID}/dashboard`} replace />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
