import { useUrlFilter } from "../../hooks/useUrlFilter";
import { FilterPill } from "./FilterPill";
import styles from "./StatusFilterPills.module.scss";

type StatusFilterPillsProps = {
  options: string[];
};

export const StatusFilterPills = ({ options }: StatusFilterPillsProps) => {
  const { value: selectedStatuses, setValue } = useUrlFilter("status");

  const selectedOptions = options.filter((o) =>
    selectedStatuses.includes(o.toLowerCase()),
  )
  .map((option) => option.toLowerCase());

  return (
    <div className={styles.filterPills}>
      {/* Pill Buttons */}
      <div className={styles.filterPillsGroup}>
        {options.map((option) => {
          const optionId = option.toLowerCase();
          const isActive =
            selectedOptions.includes(optionId) ||
            (optionId === "all" && selectedOptions.length === 0);
          return (
            <FilterPill
              key={optionId}
              option={option}
              isActive={isActive}
              onClick={() =>
                setValue([option === "All" ? "" : option.toLowerCase()])
              }
            />
          );
        })}
      </div>
    </div>
  );
};
