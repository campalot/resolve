import Button from "../../components/Buttons/Button";
import { ButtonType } from "../../components/Buttons/Button";
import { StatusFilterPills } from "../../components/Filters/StatusFilterPills";
import { SortFilter } from "../../components/Filters/SortFilter";
import LocalSearch from "../../components/Search/LocalSearch";
import { IDENTITIES_SORT } from "./identities.config";
import FilterIcon from "../../assets/filters-svgrepo-com.svg?react";
import { BottomSheet } from "../../components/BottomSheet/BottomSheet";
import { ClearFilters } from "../../components/Filters/ClearFilters";

type FiltersSheetProps = {
  isOpen: boolean;
  close: () => void;
  appliedFilterCount: number;
};

export const IdentitiesFilterSheet: React.FC<FiltersSheetProps> = ({
  isOpen,
  close,
  appliedFilterCount,
}) => {
  return (
    <BottomSheet
      isOpen={isOpen}
      close={close}
      description="Filter and sort people"
    >
      <BottomSheet.Header
        icon={<FilterIcon />}
        title="Filters"
        close={close}
        count={appliedFilterCount}
      />
      <BottomSheet.Content description="identity filters on mobile">
        <LocalSearch placeholder="Search People" />
        <BottomSheet.Section>
          <StatusFilterPills options={["All", "Active", "Inactive"]} />
        </BottomSheet.Section>
        <BottomSheet.Section>
          <SortFilter options={IDENTITIES_SORT} />
        </BottomSheet.Section>
      </BottomSheet.Content>
      <BottomSheet.Footer>
        <ClearFilters />{" "}
        <Button buttonType={ButtonType.Primary} onClick={close}>
          Done
        </Button>
      </BottomSheet.Footer>
    </BottomSheet>
  );
};
