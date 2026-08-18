"use client"; 

import Link from "next/link";
import { UserMenu } from "../UserMenu/UserMenu";
import { useWorkspace } from "@/contexts/Workspace/WorkspaceContext";
import ResolveLogo from "@/assets/approved-aproved-confirm-2-svgrepo-com.svg";
import styles from "./Header.module.scss";

export const Header: React.FC = () => {
  const workspace = useWorkspace();

  function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 60%, 60%)`;
  }

  return (
    <header
      className={styles.header}
      style={{
        background: stringToColor(workspace.id),
      }}
    >
      <Link className={styles.left} href={"/dashboard"}>
        {`${workspace.name} Workspace`}
        <span className={styles.separator}>/</span>
        <span className={styles.productName}>Res<ResolveLogo />lve</span>
      </Link>
      <UserMenu />
    </header>
  );
};
