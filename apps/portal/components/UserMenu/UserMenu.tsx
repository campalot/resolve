"use client";

import { useState } from "react";
import Link from "next/link";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Box from "@mui/material/Box";
import { Avatar as AvatarUi } from "@resolve/ui";
import IconSignOut from "@/assets/sign-out-2-svgrepo-com.svg";
import { useCurrentUser } from "@/contexts/CurrentUser/CurrentUserContext";
import styles from "./UserMenu.module.scss";

export const UserMenu: React.FC = () => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const { currentUser, currentUserIdentity, selectCurrentUser} = useCurrentUser();

  if (!currentUserIdentity) {
    return null;
  }

  const open = Boolean(anchor);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchor(e.currentTarget);
  };

  const handleClose = () => {
    setAnchor(null);
  };

  const handleLogout = () => {
    setAnchor(null);
    selectCurrentUser(null);
  }

  return (
    <>
      <Box component="div">
        <Box
          component="div"
          className={`${styles.userAvatarContainer} ${open ? styles.open : ""}`}
        >
          <IconButton
            aria-label="User menu"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls="user-menu"
            title={currentUserIdentity?.name}
            onClick={handleOpen}
            className={styles.userAvatarButton}
          >
            <AvatarUi
              identity={currentUserIdentity}
              profileUrl=""
              addLink={false}
              decorative={false}
            />
          </IconButton>
        </Box>
      </Box>

      <Popover
        open={open}
        anchorEl={anchor}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box p={0} id="user-menu" role="menu" aria-label="User menu">
          <Box className={styles.userMenuTop}>
            Signed in as <strong>{currentUser?.name}</strong>
          </Box>
          <Box className={styles.userMenuBottom}>
            <Link
              className={styles.menuLink}
              href={`/login`}
              onClick={handleLogout}
            >
              <IconSignOut />
              Sign out
            </Link>
          </Box>
        </Box>
      </Popover>
    </>
  );
};
