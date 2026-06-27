import React, { useRef, useState } from "react";
import type { ReactNode } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useKeyDown } from "../../hooks/useKeyDown";
import { ModalContext } from "./ModalContext";
import styles from "./Modals.module.scss";

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement>(null); 

  const openModal = (content: ReactNode) => {
    triggerElementRef.current = document.activeElement as HTMLElement;
    setModalContent(content);
    setIsOpen(true);
  };

  const closeModal = () => {
    setModalContent(null);
    setIsOpen(false);
    triggerElementRef.current?.focus();
  };

  // Trap focus and listen for Esc if mobile AND open
  useFocusTrap(modalRef, isOpen);
  useKeyDown("Escape", closeModal, isOpen);

  return (
    <ModalContext.Provider
      value={{ openModal, closeModal, modalContent, isOpen }}
    >
      {children}
      {isOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
          >
            {modalContent}
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};;
