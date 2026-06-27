import Button, { ButtonType } from "../../components/Buttons/Button";
import { useInteractionsReferenceData } from "../../contexts/InteractionReferenceData/InteractionsReferenceDataContext";
import { PartiesFilter } from "../../components/Filters/PartiesFilter";
import { StatusFilter } from "../../components/Filters/StatusFilter";
import { TypeFilter } from "../../components/Filters/TypeFilter";
import { DateRangeFilter } from "../../components/Filters/DateRange/DateRangeFilter";
import { SortFilter } from "../../components/Filters/SortFilter";
import LocalSearch from "../../components/Search/LocalSearch";
import FilterIcon from "../../assets/filters-svgrepo-com.svg?react";
import { INTERACTIONS_SORT } from "./interactions.config";
import { BottomSheet } from "../../components/BottomSheet/BottomSheet";
import { ClearFilters } from "../../components/Filters/ClearFilters";

type FiltersSheetProps = {
  isOpen: boolean;
  close: () => void;
  appliedFilterCount: number;
};

export const InteractionsFilterSheet: React.FC<FiltersSheetProps> = ({
  isOpen,
  close,
  appliedFilterCount,
}) => {
  const { parties, statuses, types } = useInteractionsReferenceData();

  return (
    <BottomSheet
      isOpen={isOpen}
      close={close}
      description="Filter and sort interactions"
    >
      <BottomSheet.Header
        icon={<FilterIcon />}
        title="Filters"
        close={close}
        count={appliedFilterCount}
      />
      <BottomSheet.Content description="interaction filters on mobile">
        <LocalSearch placeholder="Search interactions" />
        <BottomSheet.Section>
          <StatusFilter options={statuses} />
        </BottomSheet.Section>
        <BottomSheet.Section>
          <DateRangeFilter />
        </BottomSheet.Section>
        <BottomSheet.Section>
          <PartiesFilter options={parties} />
        </BottomSheet.Section>
        <BottomSheet.Section>
          <TypeFilter options={types} />
        </BottomSheet.Section>
        <BottomSheet.Section>
          <SortFilter options={INTERACTIONS_SORT} />
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
