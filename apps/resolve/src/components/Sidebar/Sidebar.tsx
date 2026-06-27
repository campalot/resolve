import { useRef } from "react";
import { NavLink } from "react-router-dom";
import { Route } from "../../routes/routes";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useKeyDown } from "../../hooks/useKeyDown";
import IconClose from "../../assets/icon-close.svg?react";
import IconFeed from "../../assets/news-feed-svgrepo-com.svg?react";
import IconInbox from "../../assets/inbox-svgrepo-com.svg?react";
import IconPeople from "../../assets/people-svgrepo-com.svg?react";
import { useWorkspacePath } from "../../hooks/useWorkspacePath";
import { WorkspaceSwitcher } from "../WorkspaceSwitcher/WorkspaceSwitcher";
import styles from "./Sidebar.module.scss";

const NAV_ITEMS = [
  { label: "Activity", to: Route.Home, icon: IconFeed },
  { label: "Interactions", to: Route.Interactions, icon: IconInbox },
  { label: "People", to: Route.People, icon: IconPeople },
];

type SidebarProps = {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, isMobile, onClose }) => {
  const sidebarRef = useRef<HTMLElement>(null);
  const workspacePath = useWorkspacePath();


  // Trap focus and listen for Esc if mobile AND open
  useFocusTrap(sidebarRef, isMobile && isOpen);
  useKeyDown("Escape", onClose, isMobile && isOpen);

  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen && isMobile ? styles.isVisible : ""}`}
        onClick={onClose}
      />
      <aside
        id="sidebar-nav"
        className={`${styles.sidebar} ${isOpen && isMobile ? styles.isOpen : ""}`}
        aria-hidden={isMobile && !isOpen}
        ref={sidebarRef}
        role={isMobile ? "dialog" : undefined}
        // @ts-expect-error - React 18 doesn't support boolean inert, using string to avoid console warning
        inert={isMobile && !isOpen ? "" : undefined}
      >
        {isMobile && (
          <>
            <WorkspaceSwitcher />
            <button
              type="button"
              aria-label="Close navigation menu"
              aria-controls="sidebar-nav"
              className={styles.close}
              onClick={onClose}
            >
              <IconClose />
            </button>
          </>
        )}
        <nav id="app-sidebar" aria-label="Primary">
          {NAV_ITEMS.map(({ label, to, icon: NavIcon }) => (
            <NavLink
              key={to}
              to={workspacePath(to)}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
              onClick={isOpen && isMobile ? onClose : undefined}
            >
              <NavIcon className={styles.navIcon} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};;
