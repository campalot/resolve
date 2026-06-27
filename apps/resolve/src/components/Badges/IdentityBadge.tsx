import React from "react";
import { Link } from "react-router-dom";
import type { Identity } from "../../types/schema";
import { useWorkspacePath } from "../../hooks/useWorkspacePath";
import { identityRoute } from "../../routes/routes";
import Avatar from "../Avatars/Avatar";
import styles from "./IdentityBadge.module.scss";

type Size = "sm" | "md" | "lg";

type IdentityBadgeProps = {
  identity: Pick<Identity, "id" | "name">;
  size?: Size;
  isSquare?: boolean;
  link?: boolean;
};

const SIZE_MAP = {
  sm: { avatar: 24, font: "var(--font-size-sm)" },
  md: { avatar: 32, font: "var(--font-size-md)" },
  lg: { avatar: 40, font: "var(--font-size-lg)" },
};

const IdentityBadge: React.FC<IdentityBadgeProps> = ({
  identity,
  size = "sm",
  isSquare = false,
  link = true,
}) => {
  const workspacePath = useWorkspacePath();
  const profilePath = workspacePath(identityRoute(identity.id));

  const { avatar } = SIZE_MAP[size];
  const sizeClass =
    styles[
      `size${size.charAt(0).toUpperCase() + size.slice(1)}`
    ];

  const content = (
    <span className={styles.badge}>
      <Avatar identity={identity} size={avatar} isSquare={isSquare} />
      <span
        className={`${styles.name} ${sizeClass}`}
        style={{ fontWeight: link ? 600 : 400 }}
      >
        {identity.name}
      </span>
    </span>
  );

  if (!link) {
    return content;
  }

  return (
    <Link
      to={profilePath}
      className={styles.link}
      aria-label={`View profile for ${identity.name}`}
    >
      {content}
    </Link>
  );
};

export default IdentityBadge;
