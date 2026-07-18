import React from "react";
import type { ReactNode } from "react";
import type { Identity } from "@resolve/types";
import styles from "./Avatar.module.scss";


type AvatarProps = {
  identity: Pick<Identity, "id" | "name" | "avatarUrl">;
  profileUrl: string;
  renderLink?: (children: ReactNode, url?: string) => ReactNode;
  size?: number;
  isSquare?: boolean;
  decorative?: boolean;
  addLink?: boolean;
};

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 60%)`;
}

const Avatar: React.FC<AvatarProps> = ({
  identity,
  profileUrl,
  renderLink,
  size = 40,
  isSquare = false,
  decorative = true,
  addLink = false,
}) => {

  const initials = identity.name
    .trim()
    .split(/\s+/)
    // Filter out empty strings just in case
    .filter(Boolean)
    // Map to first letters
    .map((word) => word[0])
    // Slice to 2 for names like "Liam John Smith" -> "LJ"
    // or leave as is for "Gamma" -> "G"
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const fontSize = Math.max(size * 0.4, 11);

  const avatarDisplay = (
    <div
      className={`${styles.avatar} ${isSquare ? styles.avatarSquare : styles.avatarCircle}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : identity.name}
      aria-hidden={decorative ? "true" : undefined}
      style={{
        background: stringToColor(identity.id),
        width: size,
        height: size,
        fontSize: fontSize + "px",
      }}
    >
      {identity?.avatarUrl ? (
        <img src={identity?.avatarUrl} width="100%" height="100%" />
      ) : (
        initials
      )}
    </div>
  );

  return addLink && renderLink
    ? renderLink(avatarDisplay, profileUrl)
    : avatarDisplay;
  
};

export default Avatar;
