"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./page.module.css";
import type { Identity } from "@resolve/types";
import { useIdentities } from "@/hooks/useIdentities";
import { useCurrentUser } from "@/contexts/CurrentUser/CurrentUserContext";

const LOGGED_IN_REDIRECT = `/dashboard`;

export default function Login() {
  const { identities } = useIdentities({
    filters: {
      type: ["Individual"],
    },
    page: 1,
    pageSize: 80,
  });
  const router = useRouter();
  const { currentUser, selectCurrentUser } = useCurrentUser();

  const updateSelection = (dropdown) => {
    console.log("user select=",dropdown.target.value);
    // 1. Get the raw value of the selected option
    const selectedValue = dropdown.target.value;
    const selectedIdentity = identities?.find((i) => i.id === selectedValue);
    if (selectedIdentity) {
      selectCurrentUser(selectedIdentity);
      router.replace(LOGGED_IN_REDIRECT);
    }
  };


 useEffect(() => {
   if (currentUser) {
     router.replace(LOGGED_IN_REDIRECT);
   }
 }, [currentUser, router]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            LOGIN
          </label><p />
          <select
            onChange={updateSelection}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="">Select a current user</option>
            {identities.map((identity: Identity, idx: number) => {
              return (
                <option key={identity.id} value={identity.id}>
                  {identity.name}
                </option>
              );
            })}
          </select>
        </div>
      </main>
    </div>
  );
}
