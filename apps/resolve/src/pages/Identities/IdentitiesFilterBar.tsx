import { useHasActiveFilters } from "../../hooks/useHasActiveFilters";
import { StatusFilterPills } from "../../components/Filters/StatusFilterPills";
import { SortFilter } from "../../components/Filters/SortFilter";
import LocalSearch from "../../components/Search/LocalSearch";
import { ClearFilters } from "../../components/Filters/ClearFilters";
import { Toolbar } from "../../components/Toolbars/Toolbar";
import { IDENTITIES_SORT } from "./identities.config";

export const IdentitiesFilterBar: React.FC = () => {
  const hasActiveFilters = useHasActiveFilters();
  
  return (
    <Toolbar>
      <Toolbar.Top>
        <LocalSearch placeholder="Search people" />
        <Toolbar.SortGroup>
          <SortFilter options={IDENTITIES_SORT} />
          {hasActiveFilters && <ClearFilters />}
        </Toolbar.SortGroup>
      </Toolbar.Top>
      <Toolbar.Bottom>
        <Toolbar.Label>Status</Toolbar.Label>
        <StatusFilterPills options={["All", "Active", "Inactive"]} />
      </Toolbar.Bottom>
    </Toolbar>
  );
};
