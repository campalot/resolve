import React from "react";
import type { ReactNode } from "react";
import type { Identity } from "@resolve/types";
import Avatar from "../../Avatar/Avatar";
import styles from "./IdentityBadge.module.scss";

type Size = "sm" | "md" | "lg";

type IdentityBadgeProps = {
  identity: Pick<Identity, "id" | "name">;
  profileUrl: string;
  renderLink: (children: ReactNode, url: string, className: string) => ReactNode;
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
  profileUrl,
  renderLink,
  size = "sm",
  isSquare = false,
  link = true,
}) => {
  const { avatar } = SIZE_MAP[size];
  const sizeClass =
    styles[
      `size${size.charAt(0).toUpperCase() + size.slice(1)}`
    ];

  const content = (
    <span className={styles.badge}>
      <Avatar
        identity={identity}
        profileUrl={profileUrl}
        size={avatar}
        isSquare={isSquare}
      />
      <span
        className={`${styles.name} ${sizeClass}`}
        style={{ fontWeight: link ? 600 : 400 }}
      >
        {identity.name}
      </span>
    </span>
  );

  return link ? renderLink(content, profileUrl, styles.link) : content;
};

export default IdentityBadge;
