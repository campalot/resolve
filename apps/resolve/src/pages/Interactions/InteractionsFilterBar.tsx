import { useState } from "react";
import { useInteractionsReferenceData } from "../../contexts/InteractionReferenceData/InteractionsReferenceDataContext";
import { useHasActiveFilters } from "../../hooks/useHasActiveFilters";
import { PartiesFilter } from "../../components/Filters/PartiesFilter";
import { StatusFilter } from "../../components/Filters/StatusFilter";
import { TypeFilter } from "../../components/Filters/TypeFilter";
import { DateRangeFilter } from "../../components/Filters/DateRange/DateRangeFilter";
import { ClearFilters } from "../../components/Filters/ClearFilters";
import LocalSearch from "../../components/Search/LocalSearch";
import { SortFilter } from "../../components/Filters/SortFilter";
import Button, { ButtonType } from "../../components/Buttons/Button";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import { ArrowDropUp } from "@mui/icons-material";
import { Toolbar } from "../../components/Toolbars/Toolbar";
import { INTERACTIONS_SORT } from "./interactions.config";
import styles from "../../components/Toolbars/Toolbar.module.scss";

export const InteractionsFilterBar:React.FC = () => {
  const { parties, statuses, types } = useInteractionsReferenceData();
  const [showMore, setShowMore] = useState<boolean>(false);
  const hasActiveFilters = useHasActiveFilters();

  return (
    <Toolbar>
      <Toolbar.Top>
        <LocalSearch placeholder="Search interactions" />
        <Toolbar.SortGroup>
          <SortFilter options={INTERACTIONS_SORT} />
          {hasActiveFilters && <ClearFilters />}
        </Toolbar.SortGroup>
      </Toolbar.Top>
      <Toolbar.Bottom>
        <div className={styles.filter}>
          <Toolbar.Label>Status</Toolbar.Label>
          <StatusFilter options={statuses} />
        </div>
        <DateRangeFilter />
        <Button
          buttonType={ButtonType.Text}
          onClick={() => setShowMore(!showMore)}
          aria-expanded={showMore}
          aria-controls="secondary-filters"
        >
          {showMore ? (
            <>
              Less Filters <ArrowDropUp />
            </>
          ) : (
            <>
              More Filters <ArrowDropDownIcon />
            </>
          )}
        </Button>
      </Toolbar.Bottom>
      {showMore && (
        <Toolbar.Secondary>
          <div className={styles.filter}>
            <Toolbar.Label>Parties</Toolbar.Label>
            <PartiesFilter options={parties} />
          </div>
          <div className={styles.filter}>
            <Toolbar.Label>Types</Toolbar.Label>
            <TypeFilter options={types} />
          </div>
        </Toolbar.Secondary>
      )}
    </Toolbar>
  );
};
