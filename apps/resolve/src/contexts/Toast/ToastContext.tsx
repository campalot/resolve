import { createContext, useContext } from "react";
import type { ToastType } from "./ToastProvider";

type ToastContextData = {
  addToast: (msg: string, type: ToastType) => void;
};


export const ToastContext = createContext<ToastContextData | null>(null);

export function useToast(): ToastContextData {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("Toast messages must be used within a ToastProvider");
  }

  return context;
}
