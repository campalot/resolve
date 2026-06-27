import styles from "./StatusFilterPills.module.scss";

type FilterPillProps = {
  option: string;
  isActive: boolean;
  onClick: () => void;
};

export const FilterPill = ({ option, isActive, onClick }: FilterPillProps) => {
  return (
    <button
      onClick={onClick}
      className={`${styles.filterPill} ${isActive ? styles.active : ""}`}
    >
      {option}
    </button>
  );
};
