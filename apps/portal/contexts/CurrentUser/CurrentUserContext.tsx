"use client";

import { createContext, useContext } from "react";
import type { Identity, CurrentUser } from "@resolve/types";

type CurrentUserContextData = {
  currentUser: CurrentUser | null;
  currentUserIdentity: Identity | null;
  selectCurrentUser: (identity: Identity | null) => void;
  isHydrated: boolean;
};

export const CurrentUserContext = createContext<CurrentUserContextData | null>(
  null,
);

export function useCurrentUser(): CurrentUserContextData {
  const context = useContext(CurrentUserContext);

  if (!context) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }

  return context;
}
