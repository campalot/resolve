import { useEffect, useState } from "react";
import type { ToastType } from "./ToastProvider";
import IconCheckmark from "../../assets/checkmark-svgrepo-com.svg?react";
import IconError from "../../assets/icon-close.svg?react";
import IconInfo from "../../assets/info-svgrepo-com.svg?react";
import styles from "./ToastProvider.module.scss";

export const Toast = ({
  message,
  onExited,
  type,
  index,
}: {
  message: string;
  onExited: () => void;
  type: ToastType;
  index: number;
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsExiting(true), 3000);
    const unmountTimer = setTimeout(onExited, 3700); // Wait for exit animation
    return () => {
      clearTimeout(timer);
      clearTimeout(unmountTimer);
    };
  }, [onExited]);

  return (
    <div
      className={`${styles.toast}  ${styles[type]} ${isExiting ? styles.exit : ""}`}
      style={{
        pointerEvents: "auto", // Allow interaction with the toast itself
        animationDelay: isExiting ? `${index * 0.1}s` : "0s", // apply the stagger delay when exiting.
      }}
    >
      <div className={styles.toastIcon}>
        {type === "success" && <IconCheckmark />}
        {type === "error" && <IconError />}
        {type === "info" && <IconInfo />}
      </div>
      <div className={styles.toastContent}>{message}</div>
    </div>
  );
};
