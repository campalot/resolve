import { useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useInteractions } from "../../hooks/useInteractions";
import Pagination from "../../components/Pagination/Pagination";
import styles from "./Interactions.module.scss";
import { InteractionsList } from "./InteractionsList";
import { InteractionsFilterBar } from "./InteractionsFilterBar";
import { InteractionsFilterSheet } from "./InteractionsFilterSheet";
import { BreakpointContext } from "../../contexts/Breakpoints/BreakpointContext";
import FilterIcon from "../../assets/filters-svgrepo-com.svg?react";
import Button from "../../components/Buttons/Button";
import { InteractionsListSkeleton } from "./InteractionsListSkeleton";

const PARAM_PARTY = "partyId";

export const Interactions: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isMobile } = useContext(BreakpointContext);
  const [isOpen, setIsOpen] = useState(false);
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const status = searchParams.getAll("status") || undefined;
  const type = searchParams.getAll("type") || undefined;
  const identityId = searchParams.get("identityId") || undefined;
  const searchQuery = searchParams.get("q") || undefined;
  const parties = searchParams.getAll(PARAM_PARTY);
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;
  const sortBy = searchParams.get("sortBy") || undefined;
  const filters = useMemo(
    () => ({
      status,
      type,
      identityId,
      searchQuery,
      parties,
      startDate,
      endDate,
    }),
    [status, type, identityId, searchQuery, parties, startDate, endDate],
  );

  const appliedFilterCount =
    (status?.length ?? 0) +
    (type?.length ?? 0) +
    (parties?.length ?? 0) +
    (startDate && endDate ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const { interactions, total, loading, error } = useInteractions({
    page,
    pageSize,
    filters,
    sortBy,
  });

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
    document.getElementById("interactions-table")?.focus();
  }, [page, pageSize]);

  if (error) return <div>Failed to load interactions</div>;

  return (
    <section className={styles.interactions}>
      <h1 id="interactions-table" tabIndex={-1}>
        Interactions ({total})
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
        />
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          Showing {total} results. Page {page} of{" "}
          {Math.ceil(total / pageSize)}.
        </div>
      </div>

      {!isMobile && <InteractionsFilterBar />}

      {isMobile && (
        <InteractionsFilterSheet
          close={() => setIsOpen(false)}
          isOpen={isOpen}
          appliedFilterCount={appliedFilterCount}
        />
      )}

      {loading ? (
        <InteractionsListSkeleton />
      ) : (
        <InteractionsList interactions={interactions} />
      )}
    </section>
  );
};
