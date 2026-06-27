/* eslint-disable react-refresh/only-export-components */
import { useEffect } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { ModalProvider } from "../../src/components/Modals/ModalProvider";
import { ToastProvider } from "../../src/contexts/Toast/ToastProvider";
import { client } from "../../src/api/mockApolloClient";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAppStore } from "../../src/store/useAppStore";
import { workspaceKeys, referenceKeys } from "../../src/hooks/queryKeys";
import { getMockDb, resetMockDb } from "../../src/mocks/mockDB";
import { GET_WORKSPACES } from "../../src/graphql/queries/getWorkspaces";

interface LocationStateProps {
  pathname: string;
  search: string;
}

const locationRef = {
  current: null as LocationStateProps | null,
};

// Keep this component internal to avoid export conflicts
function LocationObserver() {
  const location = useLocation();

  useEffect(() => {
    // Updating a ref property inside useEffect is the standard
    // way to handle side effects like this.
    locationRef.current = location;
  }, [location]);

  return null;
}

type Options = {
  route?: string;
};

export function renderWithRouter(
  ui: React.ReactElement,
  { route = "/w/alpha/dashboard" }: Options = {},
) {
  // 1. Get the strategy from the environment variable (passed from the terminal)
  // Vite automatically prefixes env vars with VITE_
  const testStrategy = (import.meta.env.VITE_TEST_STRATEGY || "TANSTACK") as
    | "APOLLO"
    | "TANSTACK";

  useAppStore.getState().setDataStrategy(testStrategy);
  useAppStore.getState().setSyncing(false);
  console.log(`🧪 Running test suite with strategy: ${testStrategy}`);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't hang the test on failure
        staleTime: 0,
        gcTime: 0,
      },
    },
  });

  // Pre-fill the "Workspaces" query so the boundary doesn't crash or redirect
  queryClient.setQueryData(workspaceKeys.all, {
    workspaces: [
      { id: "alpha", name: "Alpha Workspace" },
      { id: "beta", name: "Beta Workspace" },
    ],
  });
  client.writeQuery({
    query: GET_WORKSPACES,
    data: { workspaces: getMockDb().workspaces },
  });
  queryClient.setQueryData(referenceKeys.interactions("alpha"), {
    parties: [], // or mock parties
    interactionStatuses: ["DRAFT", "IN_REVIEW", "APPROVED", "REJECTED"],
    interactionTypes: [
      "PROPOSAL",
      "CONTRACT",
      "POLICY_UPDATE",
      "VENDOR_ONBOARDING",
    ],
  });

  resetMockDb();
  const db = getMockDb();

  // Force the specific IDs test expects
  if (db.workspaces.length > 0) {
    db.workspaces[0].id = "alpha";
    db.workspaces[0].name = "Alpha Workspace";
  }

  const result = render(
    <ToastProvider>
      <ModalProvider>
        <MemoryRouter initialEntries={[route]}>
          <ApolloProvider client={client}>
            <QueryClientProvider client={queryClient}>
              <LocationObserver />
              {ui}
            </QueryClientProvider>
          </ApolloProvider>
        </MemoryRouter>
      </ModalProvider>
    </ToastProvider>,
  );

  return {
    ...result,
    getLocation: (): LocationStateProps => {
      if (!locationRef.current) {
        throw new Error("LocationObserver has not mounted yet.");
      }
      return locationRef.current;
    },
  };
}
