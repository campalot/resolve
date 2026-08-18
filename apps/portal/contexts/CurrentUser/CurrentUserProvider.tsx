"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { CurrentUserContext } from "./CurrentUserContext";
import type { CurrentUser } from "./CurrentUserContext";
import type { Identity } from "@resolve/types";

type CurrentUserProviderProps = {
  children: ReactNode;
};

const STORAGE_KEY = "CURRENT_USER_IDENTITY";

export const CurrentUserProvider: React.FC<CurrentUserProviderProps> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [currentUserIdentity, setCurrentUserIdentity] =
    useState<Identity | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const selectCurrentUser = (identity: Identity | null) => {
    setCurrentUserIdentity(identity);
    setCurrentUser(
      identity
        ? {
            id: identity.id,
            name: identity.name,
            accessibleWorkspaceIds: [identity.workspaceId],
            role: "Admin",
          }
        : null,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  };

  useEffect(() => {
    // This safely runs only in the browser
    const savedCurrentUser = localStorage.getItem(STORAGE_KEY);
    if (savedCurrentUser) {
      selectCurrentUser(JSON.parse(savedCurrentUser));
      setIsHydrated(true);
    }
  }, []);

  return (
    <CurrentUserContext.Provider
      value={{
        currentUser,
        currentUserIdentity,
        selectCurrentUser,
        isHydrated,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
};
