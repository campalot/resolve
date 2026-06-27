import { createContext } from "react";
import type { ReactNode } from "react";

type ModalContextProps = {
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
  modalContent: ReactNode | null;
  isOpen: boolean;
}

export const ModalContext = createContext<ModalContextProps>({
  openModal: () => {},
  closeModal: () => {},
  modalContent: null,
  isOpen: false,
});


