import React from "react";
import styles from "./IdentifierBadge.module.scss";

export type IdentifierBadgeSize = "small" | "medium" | "large";

type TextBadgeProps = {
  text: string;
  size?: IdentifierBadgeSize;
}

const IdentifierBadge: React.FC<TextBadgeProps> = ({
  text,
  size,
}) => {
  const defaultSize = "medium";
  
  return (
    <span
      className={`${styles.identifierBadge} ${styles[size || defaultSize]}`}
    >
      {text}
    </span>
  );
};

export default IdentifierBadge;