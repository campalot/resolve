import type { ReactNode } from "react";
import { useState } from "react";
import { ToastContext } from "./ToastContext";
import { Toast } from "./Toast";
import styles from "./ToastProvider.module.scss";

export type ToastType = "info" | "success" | "error" | "neutral";
type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: string) => {
    setToasts([...toasts].filter((t) => t.id !== id));
  }

  const addToast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Render the toasts near the top of the screen */}
      <div className={styles.toastContainer}>
        {toasts.map((t, i) => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            onExited={() => removeToast(t.id)}
            index={i}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}



