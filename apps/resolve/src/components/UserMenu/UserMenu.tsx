import { useState } from "react";
import { Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Box from "@mui/material/Box";
import Avatar from "../Avatars/Avatar";
import { identityRoute } from "../../routes/routes";
import IconSettings from "../../assets/settings-svgrepo-com.svg?react";
import IconProfile from "../../assets/profile-svgrepo-com.svg?react";
import IconSignOut from "../../assets/sign-out-2-svgrepo-com.svg?react";
import { getMockDb } from "../../mocks/mockDB";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useWorkspacePath } from "../../hooks/useWorkspacePath";
import styles from "./UserMenu.module.scss"

export const UserMenu: React.FC = () => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const currentUser = useCurrentUser();
  const workspacePath = useWorkspacePath();
  const mockDb = getMockDb();
  const currentUserIdentity = mockDb.identities.find((i) => i.id === currentUser.id);
  
  if (!currentUserIdentity) {
    throw new Error("current user nout found");
  }

  const open = Boolean(anchor);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchor(e.currentTarget);
  };

  const handleClose = () => {
    setAnchor(null);
  };

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
            <Avatar identity={currentUserIdentity} decorative={false} />
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
            Signed in as <strong>{currentUser.name}</strong>
          </Box>
          <Box className={styles.userMenuLinks}>
            <Link
              className={styles.menuLink}
              to={identityRoute(currentUser.id)}
              onClick={handleClose}
            >
              <IconProfile />
              Profile
            </Link>
            <Link
              className={styles.menuLink}
              to={workspacePath("settings")}
              onClick={handleClose}
            >
              <IconSettings />
              Settings
            </Link>
          </Box>
          <Box className={styles.userMenuBottom}>
            <Link
              className={styles.menuLink}
              to={workspacePath("signout")}
              onClick={handleClose}
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
