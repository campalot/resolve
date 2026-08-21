"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./page.module.css";
import type { Identity } from "@resolve/types";
import { useIdentities } from "@/hooks/useIdentities";
import { useCurrentUser } from "@/contexts/CurrentUser/CurrentUserContext";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import { Button } from "@resolve/ui";
import { ButtonType } from "@resolve/ui";
import { SelectChangeEvent } from "@mui/material";

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
  const [selectedIdentity, setSelectedIdentity] = useState<Identity | null>(null);

  const updateSelection = (event: SelectChangeEvent) => {
    // 1. Get the raw value of the selected option
    const selectedValue = event.target.value;
    const selectedUserIdentity = identities?.find(
      (i: Identity) => i.id === selectedValue,
    );
    if (selectedUserIdentity) {
      setSelectedIdentity(selectedUserIdentity);
    }
  };

  const goToRedirect = () => {
    if (selectedIdentity) {
      selectCurrentUser(selectedIdentity);
    }
  }


 useEffect(() => {
   if (currentUser) {
     router.replace(LOGGED_IN_REDIRECT);
   }
 }, [currentUser, router]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <h2>Welcome to Resolve Portal</h2>
          <p>Select the user you&#39;d like to simulate.</p>
          <FormControl sx={{ mt: 1, mb: 1, minWidth: 320 }}>
            <InputLabel id="demo-select-small-label">Select a User</InputLabel>
            <Select
              labelId="user-select"
              id="user-select"
              label="Select a User"
              onChange={updateSelection}
              value={selectedIdentity?.id ?? ""}
            >
              {identities.map((identity: Identity, idx: number) => {
                return (
                  <MenuItem key={identity.id} value={identity.id}>
                    {identity.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <Button
            buttonType={ButtonType.Primary}
            disabled={!selectedIdentity}
            onClick={goToRedirect}
          >
            Continue
          </Button>
        </div>
      </main>
    </div>
  );
}
