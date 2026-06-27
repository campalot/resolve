import { useContext } from "react";
import { CurrentUserContext } from "../contexts/CurrentUser/CurrentUserContext";
import type { CurrentUser } from "../contexts/CurrentUser/CurrentUserContext";

export function useCurrentUser(): CurrentUser {
  const context = useContext(CurrentUserContext);

  if (!context) {
    throw new Error(
      "useCurrentUser must be used within a CurrentUserProvider"
    );
  }

  if (!context.currentUser) {
    throw new Error(
      "useCurrentUser must be used within a workspace-scoped route"
    );
  }

  return context.currentUser;
}