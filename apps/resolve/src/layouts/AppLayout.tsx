import React, { Suspense, useContext, useState } from "react";
import { matchPath, Outlet, useLocation} from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { useQueryClient } from "@tanstack/react-query";
import { BreakpointContext } from "../contexts/Breakpoints/BreakpointContext";
import { Header } from "../components/Header/Header";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { useScrollLock } from "../hooks/useScrollLock";
import { Route } from "../routes/routes";
import { CurrentUserProvider } from "../contexts/CurrentUser/CurrentUserProvider";
import { useWorkspace } from "../contexts/Workspace/WorkspaceContext";
import { NotFound } from "../pages/NotFound";
import { LoadingScreen } from "../pages/LoadingScreen";
import { DevCrashTrigger } from "../components/Development/DevCrashTrigger";
import { useAppStore } from "../store/useAppStore";
import styles from "./AppLayout.module.scss";
import { ContentError } from "../pages/ErrorPages/ContentError";

export const AppLayout: React.FC = () => {
  const workspace = useWorkspace();
  const queryClient = useQueryClient();
  const { isMobile } = useContext(BreakpointContext);
  const [userSetSidebarOpen, setUserSetSidebarOpen] = useState<boolean | null>(
    null,
  );
  const { forceError, setForceError } = useAppStore();

  const location = useLocation();

  const isSidebarOpen = userSetSidebarOpen ?? !isMobile;

  const noPaddingPaths = [
    `/w/:workspaceId/${Route.IdentityDetail}`,
  ];
  const isMatch = noPaddingPaths.some((pattern) =>
    matchPath(pattern, location.pathname),
  );

  // Lock scroll only when on mobile AND the menu is active
  useScrollLock(isMobile && isSidebarOpen);

  if (!workspace) {
    return <NotFound />;
  }

  // Sidebar remains mounted to preserve focus, state, and accessibility semantics.
  // Visibility is controlled via CSS + aria/inert, not conditional rendering.

  return (
    <CurrentUserProvider>
      <div className={styles.appLayout}>
        <Header
          isSidebarOpen={isSidebarOpen}
          onMenuClick={() => setUserSetSidebarOpen(!isSidebarOpen)}
        />

        <div className={styles.body}>
          <Sidebar
            isOpen={isSidebarOpen}
            isMobile={isMobile}
            onClose={() => setUserSetSidebarOpen(false)}
          />
          <main
            className={`${styles.content} ${isMatch ? styles.noPadding : ""}`}
            // Workaround: React 18 warns on boolean 'inert'.
            // Use string/undefined + Record cast to satisfy both Browser and TS/ESLint.
            {...({
              inert: isMobile && isSidebarOpen ? "" : undefined,
            } as Record<string, unknown>)}
          >
            <ErrorBoundary
              onReset={() => {
                setForceError(null);
                queryClient.refetchQueries({ type: "active" }); // make sure to refetch query after some failure
              }}
              resetKeys={[forceError]}
              fallbackRender={({ resetErrorBoundary }) => (
                <ContentError resetErrorBoundary={resetErrorBoundary} />
              )}
            >
              {/* TRIGGER 2: Targets ONLY the Inner Content Boundary */}
              <DevCrashTrigger target={forceError} currentTarget="content" />
              <Suspense fallback={<LoadingScreen />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </CurrentUserProvider>
  );
};
