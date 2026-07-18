import React from "react";
import type { HTMLAttributes } from "react";
import type { InteractionState } from "@resolve/types";
import {
  ICON_MAP,
  StatusBadgeSize,
  sanitizeLabel,
  getStatusLabel,
} from "./statusBadgeUtils";
import styles from "./StatusBadge.module.scss";

type StatusBadgeProps = {
  status: InteractionState;
  size?: string;
  hideIcon?: boolean;
  className?: string;
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = StatusBadgeSize.Medium,
  hideIcon,
}) => {
  const modifier = sanitizeLabel(String(status));
  // Attempt to find the keys. We use bracket notation because of the dashes.
  // If your build tool converts to camelCase, use styles.statusBadge instead.
  const baseClass = styles.statusBadge;
  const modifierClass =
    styles[
      `statusBadge${modifier.charAt(0).toUpperCase() + modifier.slice(1)}`
    ];
  const sizeClass = styles[`${size}`];

  const badgeStatus = getStatusLabel(status);

  const IconComponent: React.FC<HTMLAttributes<SVGElement>> =
    ICON_MAP[status.toUpperCase()] || null;

  return (
    <span
      className={`${baseClass} ${modifierClass} ${sizeClass}`}
      role="status"
      aria-label={`Status: ${badgeStatus}`}
    >
      {IconComponent && !hideIcon && (
        <span className={styles.iconLeft}>
          <IconComponent className={styles.iconSvg} aria-hidden="true" />
        </span>
      )}
      {badgeStatus}
    </span>
  );
};;

export default StatusBadge;
