import type { ReactNode } from "react";
import styles from "./Toolbar.module.scss";

export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <section
      aria-label="Filter and sort interactions"
      className={styles.wrapper}
    >
      {children}
    </section>
  );
}

Toolbar.Top = function ToolbarTop({ children }: { children: ReactNode }) {
  return <div className={styles.top}>{children}</div>;
};

Toolbar.SortGroup = function ToolbarSortGroup({
  children,
}: {
  children: ReactNode;
}) {
  return <div className={styles.top}>{children}</div>;
};

Toolbar.Bottom = function ToolbarBottom({ children }: { children: ReactNode }) {
  return <div className={styles.bottom}>{children}</div>;
};

Toolbar.Secondary = function ToolbarSecondary({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div id="secondary-filters" className={styles.secondary}>
      {children}
    </div>
  );
};

Toolbar.Label = function ToolbarLabel({ children }: { children: ReactNode }) {
  return <span className={styles.label}>{children}</span>;
};
