"use client"; // Must be a client component

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReferenceDataProvider } from "@/contexts/ReferenceData/ReferenceDataProvider";
import { CurrentUserProvider } from "@/contexts/CurrentUser/CurrentUserProvider";
import { useState } from "react";
import { WorkspaceBoundary } from "@/components/WorkspaceRouteBoundary";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const DEFAULT_WORKSPACE_ID = "alpha";

// TODO:
// Revisit startup loading behavior after Portal Dashboard is implemented.
// Current startup metrics are <150ms, so defer optimization until
// production build and additional features are in place.

export default function Providers({ children }: { children: React.ReactNode }) {
  // Avoid initializing QueryClient globally outside the component.
  // This ensures data is not shared between different users/requests on the server.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, you usually want to set some default staleTime
            // to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <WorkspaceBoundary workspaceId={DEFAULT_WORKSPACE_ID}>
          <ReferenceDataProvider>
            <CurrentUserProvider>{children}</CurrentUserProvider>
          </ReferenceDataProvider>
        </WorkspaceBoundary>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}
