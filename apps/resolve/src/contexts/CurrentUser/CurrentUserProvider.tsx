import type { ReactNode } from "react";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { CurrentUserContext } from "./CurrentUserContext";
import type { CurrentUser } from "./CurrentUserContext";
import { useIdentities } from "../../hooks/useIdentitiies";
import { useWorkspacesList } from "../../hooks/useWorkspacesList";
import type { IdentityRecord } from "@resolve/types";
import { SimpleShellLayout } from "../../layouts/SimpleShellLayout";
import { LoadingScreen } from "../..//pages/LoadingScreen";

type CurrentUserProviderProps = {
  children: ReactNode;
};

export const CurrentUserProvider: React.FC<CurrentUserProviderProps> = ({
  children,
}) => {
  const { workspaceId } = useParams(); 
  const { identities, loading } = useIdentities(
      {
        filters: {
          type: ["Individual"],
        },
        page: 1,
        pageSize: 80,
      },
    );
  const { workspaces } = useWorkspacesList();

  const currentUser = useMemo<CurrentUser | null>(
    () => {
      if (!workspaceId || !identities) {
        return null;
      }

      const workspacePeople = identities.filter(
        (id: IdentityRecord) =>
          id.type === "Individual" && id.workspaceId === workspaceId,
      );

      if (workspacePeople.length === 0) {
        //throw new Error("No users found for workspace");
      }

      // Pure/Deterministic: Use the workspaceId string length or char code as a seed
      const index = workspaceId.length % workspacePeople.length;
      const picked = workspacePeople[index];

      const workspaceIds = workspaces.map((ws) => ws.id); // e.g., ["alpha", "beta", "gamma"]
      const subset: string[] = [];

      const hash = picked?.id.charCodeAt(7);

      // If hash % 4 === 0, give them 2 workspaces instead of 1
      if (hash % 4 === 0) {
        // Basic logic to pick 2:
        // Take the first two, or slice based on the hash to vary which two they get
        const startIndex = hash % workspaceIds.length;
        const subset = [];
        for (let i = 0; i < 2; i++) {
          subset.push(workspaceIds[(startIndex + i) % workspaceIds.length]);
        }
      }

      return picked
        ? {
            id: picked.id,
            name: picked?.name,
            // accessibleWorkspaceIds: assignWorkspacesForUser(picked.id),
            accessibleWorkspaceIds: subset.length > 0 ? subset : workspaceIds,
            role: "Admin",
          }
        : null;
    },

    [workspaceId, identities, workspaces],
  );

  if (loading) {
    return (
    <SimpleShellLayout>
      <LoadingScreen />
    </SimpleShellLayout>
    );
  }

  return (
    <CurrentUserContext.Provider value={{ currentUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
};



