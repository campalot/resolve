import type { ReactNode } from "react";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { CurrentUserContext } from "./CurrentUserContext";
import type { CurrentUser } from "./CurrentUserContext";
import { getMockDb } from "../../mocks/mockDB";
import {
  assignWorkspacesForUser,
} from "../../mocks/mockIdentities";

type CurrentUserProviderProps = {
  children: ReactNode;
};

export const CurrentUserProvider: React.FC<CurrentUserProviderProps> = ({
  children,
}) => {
  const mockDb = getMockDb();
  const { workspaceId } = useParams(); 

  const currentUser = useMemo<CurrentUser | null>(
    () => {
      if (!workspaceId) {
        return null;
      }

      const workspacePeople = mockDb.identities.filter(
        (id) => id.type === "Individual" && id.workspaceId === workspaceId,
      );

      if (workspacePeople.length === 0) {
        throw new Error("No users found for workspace");
      }

      // Pure/Deterministic: Use the workspaceId string length or char code as a seed
      const index = workspaceId.length % workspacePeople.length;
      const picked = workspacePeople[index];

      return {
        id: picked.id,
        name: picked.name,
        accessibleWorkspaceIds: assignWorkspacesForUser(picked.id),
        role: "Admin",
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workspaceId],
  );

  return (
    <CurrentUserContext.Provider value={{ currentUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
};



