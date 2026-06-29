import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSearchResults } from "../../hooks/useSearchResults";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { debounce } from "@mui/material/utils";
import { identityRoute, interactionRoute } from "../../routes/routes";
import { useWorkspacePath } from "../../hooks/useWorkspacePath";
import { SearchResultRow } from "./SearchResultRow";
import type { SearchResult } from "@resolve/types";
import styles from "./MobileSearchPage.module.scss";

export const MobileSearchPage:React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const sentinelRef = useRef(null);
  const feedRef = useRef<HTMLUListElement>(null);

  const initialQ = searchParams.get("q") ?? "";
  const [inputValue, setInputValue] = useState(initialQ);
  const [queryString, setQueryString] = useState(initialQ);
  const [isScrolled, setIsScrolled] = useState(false);

  const workspacePath = useWorkspacePath();

  const { results, loading, error, hasMore, fetchNextPage } =
    useSearchResults(queryString, 20);

  // Sync input → queryString (debounced)
  const debounceQuery = useMemo(
    () =>
      debounce((newInput: string) => {
        setQueryString(newInput);
        setSearchParams({ q: newInput });
      }, 500),
    [setSearchParams],
  );

  const isIdle = !queryString.trim();
  const hasResults = results.length > 0;

  const groupedResults = useMemo(() => {
    return {
      identities: results.filter((r) => r.__typename === "Identity"),
      interactions: results.filter((r) => r.__typename === "Interaction"),
    };
  }, [results]);

  useEffect(() => {
    setInputValue(initialQ);
    setQueryString(initialQ);
  }, [initialQ]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // entries[0] is the sentinel <li>
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchNextPage();
        }
      },
      {
        // Set the <ul> as the container to watch
        root: feedRef.current,
        threshold: 0,
        // Trigger when the sentinel is 200px away from the bottom of the viewport
        rootMargin: "0px 0px 200px 0px",
      },
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, fetchNextPage]);

  const handleNavigate = (result: SearchResult) => {
    const path =
      result.__typename === "Identity"
        ? identityRoute(result.id)
        : interactionRoute(result.id, "overview");
    navigate(workspacePath(path));
  };

  const handleCloseSearch = () => {
    const { from } = location.state || {};
    if (from) {
      // Go back to original page
      navigate(from.pathname + from.search, { replace: true });
    } else {
      // Fallback if state is missing (e.g., direct link)
      navigate("/", { replace: true });
    }
  };

  return (
    <div
      className={`${styles.mobileSearchPage} ${isScrolled ? styles.scrolled : ""}`}
    >
      <header className={styles.mobileSearchHeader}>
        <button
          aria-label="Close search"
          onClick={handleCloseSearch}
          className={styles.cancelButton}
        >
          Cancel
        </button>
        <input
          autoFocus
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            debounceQuery(e.target.value);
          }}
          placeholder="Search…"
        />
      </header>
      {isIdle && <div className={styles.state}>Start typing to search</div>}
      {!isIdle && loading && !hasResults && (
        <div className={styles.state} aria-live="polite">
          Searching…
        </div>
      )}
      {!isIdle && !loading && !hasResults && (
        <div className={styles.state}>
          <div>No results found</div>
          <div className={styles.query}>for “{queryString}”</div>
        </div>
      )}

      {error && <div>There was an error attempting to search. Try again.</div>}

      <ul
        className={styles.mobileSearchResults}
        role="list"
        onScroll={(e) => {
          const list = e.currentTarget;
          setIsScrolled(list.scrollTop > 4);
        }}
        ref={feedRef}
      >
        {hasResults &&
          Object.entries(groupedResults).map((group) => (
            <React.Fragment key={group[0]}>
              {group[1].length > 0 && (
                <li className={styles.groupLabel}>{group[0]}</li>
              )}
              {group[1].map((item) => (
                <SearchResultRow
                  key={item.id}
                  result={item}
                  onSelect={handleNavigate}
                />
              ))}
            </React.Fragment>
          ))}
        {hasResults && loading && (
          <li className={styles.loadingMore} aria-live="polite">
            Searching for more…
          </li>
        )}

        <li
          ref={sentinelRef}
          aria-hidden="true"
          style={{ height: "1px", listStyle: "none" }}
        />
      </ul>
    </div>
  );
};
