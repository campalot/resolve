import type { ReactNode } from "react";
import styles from "./AppLayout.module.scss";
import sidebarStyles from "../components/Sidebar/Sidebar.module.scss";
import headerStyles from "../components/Header/Header.module.scss";

export const SimpleShellLayout= ({ children }: { children: ReactNode }) => {
  return (
    <div className={styles.appLayout}>
      <header className={headerStyles.header}>
        <div className={headerStyles.left}>
          <span className={headerStyles.productName}>Resolve</span>
        </div>
      </header>
      <div className={styles.body}>
        <aside className={sidebarStyles.sidebar} />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
};
