import { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Box from "@mui/material/Box";
import Button from "../Buttons/Button";
import { useWorkspace } from "../../contexts/Workspace/WorkspaceContext";
import { useWorkspacesList } from "../../hooks/useWorkspacesList";
import type { Workspace } from "@resolve/types";
import Avatar from "../Avatars/Avatar";
import IconCheckmark from "../../assets/checkmark-svgrepo-com.svg?react";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import { ArrowDropUp } from "@mui/icons-material";
import styles from "./WorkspaceSwitcher.module.scss";
import { Route } from "../../routes/routes";
import type { CurrentUser } from "../../contexts/CurrentUser/CurrentUserContext";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export const WorkspaceSwitcher: React.FC = () => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const location = useLocation();
  const { workspaceId } = useParams();
  const workspace = useWorkspace();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { workspaces } = useWorkspacesList();

  const open = Boolean(anchor);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchor(e.currentTarget);
  };

  const handleClose = () => {
    setAnchor(null);
  };


  function switchWorkspace(newWorkspaceId: string) {
    if (!workspaceId) return;

    const newPath = `/w/${newWorkspaceId}/${Route.Home}`;

    navigate(`${newPath}${location.search}`);
    window.scrollTo({ top: 0 });
  }

  const availableWorkspaces = workspaces.filter((w: Workspace) =>
    (currentUser as CurrentUser).accessibleWorkspaceIds.includes(w.id),
  );

  return (
    <>
      <Box component="div">
        <Box
          component="div"
          className={`${styles.workspaceContainer} ${open ? styles.open : ""}`}
        >
          <IconButton
            aria-label="Workspace menu"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls="workspace-menu"
            onClick={handleOpen}
            className={styles.switcherButton}
          >
            <span className={styles.avatarWrapper}>
              <Avatar identity={workspace} size={20} isSquare={true} />
            </span>
            {`${workspace.name} Workspace`}{" "}
            <span className={styles.caret}>
              {open ? <ArrowDropUp /> : <ArrowDropDownIcon />}
            </span>
          </IconButton>
        </Box>
      </Box>

      <Popover
        open={open}
        anchorEl={anchor}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box p={0} id="workspace-menu" role="menu" aria-label="Workspace menu">
          <ul role="menu" id="workspace-menu" className={styles.workspaceMenu}>
            {availableWorkspaces.map((w: Workspace) => (
              <li role="none" key={w.id}>
                <Button
                  role="menuitem"
                  onClick={() => {
                    switchWorkspace(w.id);
                    handleClose();
                  }}
                >
                  <span className={styles.avatarWrapper}>
                    <Avatar identity={w} size={20} isSquare={true} />
                  </span>{" "}
                  {`${w.name} Workspace`}
                  {w.id === workspace.id && <IconCheckmark />}
                </Button>
              </li>
            ))}
          </ul>
        </Box>
      </Popover>
    </>
  );
};
