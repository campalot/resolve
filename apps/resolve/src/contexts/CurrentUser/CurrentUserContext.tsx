import { createContext, useContext } from "react";

export type CurrentUser = {
  id: string;
  name: string;
  accessibleWorkspaceIds: string[];
  role: "Legal" | "Finance" | "Admin";
};

type CurrentUserContextData = {
  currentUser: CurrentUser | null;
};

export const CurrentUserContext =
  createContext<CurrentUserContextData | null>(null);

export function useCurrentUser(): CurrentUserContextData {
  const context = useContext(CurrentUserContext);

  if (!context) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }

  return context;
}
