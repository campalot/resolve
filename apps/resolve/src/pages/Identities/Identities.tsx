import { useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useIdentities } from "../../hooks/useIdentitiies";
import Pagination from "../../components/Pagination/Pagination";
import styles from "./Identities.module.scss";
import { IdentitiesList } from "./IdentitiesList";
import { IdentitiesFilterBar } from "./IdentitiesFilterBar";
import { IdentitiesFilterSheet } from "./IdentitiesFilterSheet";
import { BreakpointContext } from "../../contexts/Breakpoints/BreakpointContext";
import FilterIcon from "../../assets/filters-svgrepo-com.svg?react";
import Button from "../../components/Buttons/Button";
import { IdentitiesListSkeleton } from "./IdentitiesListSkeleton";

const PARAM_PEOPLE = "Individual";

export const Identities: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isMobile } = useContext(BreakpointContext);
  const [isOpen, setIsOpen] = useState(false);
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 12);
  const status = searchParams.getAll("status") || undefined;
  const identityId = searchParams.get("identityId") || undefined;
  const searchText = searchParams.get("q") || undefined;
  const sortBy = searchParams.get("sortBy") || undefined;
  const filters = useMemo(
    () => ({
      status,
      identityId,
      searchText,
      type: [PARAM_PEOPLE],
    }),
    [status, identityId, searchText],
  );

  const appliedFilterCount = (status?.length ?? 0) + (searchText ? 1 : 0);

  const { identities, total, loading, isChangingParams, error } = useIdentities(
    {
      page,
      pageSize,
      filters,
      sortBy,
    },
  );

  function updateParams(
    next: Partial<Record<string, string | number | undefined>>,
  ) {
    const params = new URLSearchParams(searchParams);

    Object.entries(next).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    setSearchParams(params);
  }

  useEffect(() => {
    document.getElementById("identities-table")?.focus();
  }, [page, pageSize]);

  if (error) return <div>Failed to load identities</div>;

  return (
    <section className={styles.identities}>
      <h1 id="identities-table" tabIndex={-1}>
        People ({total})
      </h1>

      <div className={styles.paginationBar}>
        {isMobile && (
          <Button
            className={styles.filtersButton}
            onClick={() => setIsOpen(true)}
          >
            <FilterIcon />
            {appliedFilterCount > 0 && (
              <span className={styles.badge}>{appliedFilterCount}</span>
            )}
          </Button>
        )}
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={(p) => updateParams({ page: p })}
          onPageSizeChange={(s) => updateParams({ pageSize: s, page: 1 })}
          isCards={true}
        />
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          Showing {total} results. Page {page} of {Math.ceil(total / pageSize)}.
        </div>
      </div>

      {!isMobile && <IdentitiesFilterBar />}

      {isMobile && (
        <IdentitiesFilterSheet
          close={() => setIsOpen(false)}
          isOpen={isOpen}
          appliedFilterCount={appliedFilterCount}
        />
      )}

      {loading ? (
        <IdentitiesListSkeleton />
      ) : (
        <IdentitiesList identities={identities} isSorting={isChangingParams} />
      )}
    </section>
  );
};
