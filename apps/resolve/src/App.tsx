import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { ApolloProvider } from "@apollo/client";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import BreakpointProvider from "./contexts/Breakpoints/BreakpointProvider";
import { ModalProvider } from "./components/Modals/ModalProvider";
import { ToastProvider } from "./contexts/Toast/ToastProvider";
import { client } from "./api/mockApolloClient";
import AppRouting from "./routes/AppRoutes";
import { DevOverlay } from "./components/Development/DevOverlay";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SimpleShellLayout } from "./layouts/SimpleShellLayout";
import { DevCrashTrigger } from "./components/Development/DevCrashTrigger";
import { useAppStore } from "./store/useAppStore";
import { AppError } from "./pages/ErrorPages/AppError";
import { activeRoleVar } from "./api/cache";
import { ensureMsw } from "./api/mswManager";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      retryOnMount: true,
    },
  },
});

function ApolloStateBridge() {
  const activeRole = useAppStore((s) => s.activeRole);

  useEffect(() => {
    activeRoleVar(activeRole);
  }, [activeRole]);

  return null;
}

const App: React.FC = () => {
  const { forceError, setForceError } = useAppStore();

  useEffect(() => {
    const handleFocus = async () => {
      await ensureMsw();
      await queryClient.refetchQueries({ type: "active" });
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return (
    <ErrorBoundary
      onReset={() => {
        setForceError(null);
        queryClient.refetchQueries({ type: "active" }); // make sure to refetch query after some failure
      }}
      resetKeys={[forceError]}
      fallbackRender={({ resetErrorBoundary }) => (
        <SimpleShellLayout>
          <BrowserRouter>
            <AppError resetErrorBoundary={resetErrorBoundary} />
          </BrowserRouter>
        </SimpleShellLayout>
      )}
    >
      {/* TRIGGER 1: Targets the Top-Level App Boundary */}
      <DevCrashTrigger target={forceError} currentTarget="app" />
      <ApolloProvider client={client}>
        <QueryClientProvider client={queryClient}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <BreakpointProvider>
              <ToastProvider>
                <ModalProvider>
                  <BrowserRouter>
                    <ApolloStateBridge />
                    <AppRouting />
                    <DevOverlay />
                  </BrowserRouter>
                </ModalProvider>
              </ToastProvider>
            </BreakpointProvider>
          </LocalizationProvider>
        </QueryClientProvider>
      </ApolloProvider>
    </ErrorBoundary>
  );
};

export default App;
