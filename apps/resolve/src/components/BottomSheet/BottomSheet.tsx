import type { ReactNode } from "react";
import { useRef } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useKeyDown } from "../../hooks/useKeyDown";
import styles from "./BottomSheet.module.scss";
import IconClose from "../../assets/icon-close.svg?react";

type BottomSheetProps = {
  isOpen: boolean;
  close: () => void;
  description?: string;
  children: ReactNode;
};

export function BottomSheet({
  isOpen,
  close,
  description,
  children,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLElement>(null);

  // Trap focus and listen for Esc if mobile AND open
  useFocusTrap(sheetRef, isOpen);
  useKeyDown("Escape", close, isOpen);

  return (
    <>
      <div
        className={`${styles.bottomSheetOverlay} ${isOpen ? styles.active : ""}`}
        onClick={close}
        aria-hidden="true"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-describedby={description}
        aria-labelledby="bottom-sheet-title"
        aria-hidden={!isOpen}
        // Workaround: React 18 warns on boolean 'inert'. 
        // Use string/undefined + Record cast to satisfy both Browser and TS/ESLint.
        {...({
          inert: !isOpen ? "" : undefined,
        } as Record<string, unknown>)}
        className={`${styles.bottomSheet} ${isOpen ? styles.active : ""}`}
        ref={sheetRef}
      >
        {children}
      </section>
    </>
  );
}

type BottomSheetHeaderProps = {
  icon: ReactNode;
  title: string;
  close: () => void;
  count?: number;
};

BottomSheet.Header = function BottomSheetHeader({
  icon,
  title,
  count,
  close,
}: BottomSheetHeaderProps) {
  return (
    <header className={styles.sheetHeader}>
      {icon}
      <h2 id="bottom-sheet-title">
        {title}
        {!!count && count > 0 && <span className={styles.filterCount}>{count}</span>}
      </h2>
      <button
        type="button"
        aria-label={`Close bottom sheet`}
        aria-controls={`sheet-filters`}
        className={styles.close}
        onClick={close}
      >
        <IconClose />
      </button>
    </header>
  );
};

type BottomSheetContentProps = {
  description?: string;
  children: ReactNode;
};

BottomSheet.Content = function BottomSheetContent({
  children,
  description = "mobile filters",
}: BottomSheetContentProps) {
  return (
    <div
      role="region"
      aria-label={description}
      className={styles.mobileSheetContent}
    >
      {children}
    </div>
  );
};

type BottomSheetSectionProps = {
  label?: string;
  children: ReactNode;
};

BottomSheet.Section = function BottomSheetSection({
  children,
  label,
}: BottomSheetSectionProps) {
  return (
    <div className={styles.section}>
      {label && <label className={styles.sectionLabel}>{label}</label>}
      {children}
    </div>
  );
};

type BottomSheetFooterProps = {
  children?: ReactNode;
};

BottomSheet.Footer = function BottomSheetFooter({
  children,
}: BottomSheetFooterProps) {
  return (
    <footer>
      {children}
    </footer>
  );
};
