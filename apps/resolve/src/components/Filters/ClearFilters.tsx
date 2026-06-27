import Button, { ButtonType } from "../Buttons/Button";
import { useClearFilters } from "../../hooks/useClearFilters";

export const ClearFilters = () => {
  const { clear } = useClearFilters();

  return (
    <Button
      aria-label="Clear all filters"
      buttonType={ButtonType.Text}
      onClick={clear}
    >
      Clear All
    </Button>
  );
};
