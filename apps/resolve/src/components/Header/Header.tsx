import { useContext } from "react";
import { useParams } from "react-router-dom";
import type { HTMLAttributes } from "react";
import { GlobalSearchAppBar } from "../Search/GlobalSearchAppBar";
import { BreakpointContext } from "../../contexts/Breakpoints/BreakpointContext";
import IconHamburgerCollapse from "../../assets/hamburger-collapse.svg?react";
import IconHamburgerExpand from "../../assets/hamburger-expand.svg?react";
import { UserMenu } from "../UserMenu/UserMenu";
import { WorkspaceSwitcher } from "../WorkspaceSwitcher/WorkspaceSwitcher";
import styles from "./Header.module.scss";

const HAMBURGER_MAP = {
  Collapsed: IconHamburgerCollapse,
  Expanded: IconHamburgerExpand,
};

type HeaderProps = {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, isSidebarOpen }) => {
  const { isMobile } = useContext(BreakpointContext);
  const { workspaceId } = useParams();

  const ToggleComponent: React.FC<HTMLAttributes<SVGElement>> =
    HAMBURGER_MAP[isSidebarOpen ? "Expanded" : "Collapsed"] || null;

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {isMobile ? (
          <>
            <button
              type="button"
              aria-label={
                isSidebarOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={isSidebarOpen}
              aria-controls="app-sidebar"
              onClick={onMenuClick}
              className={styles.menuButton}
            >
              <ToggleComponent />
            </button>
            <span className={styles.productName}>Resolve</span>
          </>
        ) : (
          <>
            <span className={styles.productName}>Resolve</span>
            <span className={styles.separator}>/</span>
            {workspaceId && <WorkspaceSwitcher />}
          </>
        )}
      </div>
      <span className={styles.globalSearchContainer}>
        <GlobalSearchAppBar isMobile={isMobile} />
      </span>
      <UserMenu />
    </header>
  );
};



