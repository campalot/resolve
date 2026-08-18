"use client";

import { useEffect} from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/contexts/CurrentUser/CurrentUserContext";

export function PortalGate({ children }: { children: React.ReactNode }) {
  const { currentUser, isHydrated } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !currentUser) {
      router.replace("/login");
    }
  }, [isHydrated, currentUser, router]);

  if (!isHydrated) {
    return <div>Loading screen...</div>;
  }

  if (!currentUser) {
    return null;
  }

  return children;
}