import React from "react";
import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.scss";

export const ButtonType = {
  Primary: "primary",
  Secondary: "secondary",
  Destructive: "destructive",
  Text: "text",
} as const;

export type ButtonVariant = (typeof ButtonType)[keyof typeof ButtonType];
type ButtonSize = "small" | "medium";

type ButtonProps = {
  children: React.ReactNode;
  buttonType?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<ButtonProps> = ({
  children,
  buttonType,
  size,
  isLoading,
  disabled,
  ...restPops // onClick
}) => {
  return (
    <button
      className={`${styles.button} ${buttonType && styles[buttonType]} ${size && styles[size]} ${isLoading ? styles.loading : ""}`}
      disabled={isLoading || disabled}
      {...restPops}
    >
      {isLoading ? (
        <span className={styles.spinnerContent}>
          <span className={styles.spinner} />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;