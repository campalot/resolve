import React from "react";
import styles from "./SearchResultRow.module.scss";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Avatar from "../../components/Avatars/Avatar";
import StatusBadge from "../../components/Badges/StatusBadge";
import type { SearchResult } from "../../types/schema";
import type { Interaction } from "../../types/schema";
dayjs.extend(relativeTime);

type SearchResultRowProps = {
  result: SearchResult;
  onSelect: (result: SearchResult) => void;
};

export const SearchResultRow: React.FC<SearchResultRowProps> = ({
  result,
  onSelect,
}) => {
  const isIdentity = result.__typename === "Identity";

  const label = isIdentity ? result.name : (result as Interaction).title;

  return (
    <li role="listitem">
      <button
        type="button"
        role="button"
        className={styles.searchRow}
        onClick={() => onSelect(result)}
        aria-label={`Open ${label}`}
      >
        {/* Left Visual */}
        <div className={styles.leading}>
          {isIdentity ? (
            <Avatar
              identity={result}
              size={40}
              isSquare={result.type === "Company"}
            />
          ) : (
            <div className={styles.typeIcon}>
              {/* Replace with your interaction type icon system */}
              {result.type?.charAt(0)}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={styles.content}>
          <div className={styles.primaryRow}>
            <span className={styles.title} data-testid="search-result-label">
              {label}
            </span>

            {!isIdentity && <StatusBadge status={result.status} />}
          </div>

          <div className={styles.secondaryRow}>
            {isIdentity ? (
              <>
                {result.company?.name && (
                  <span className={styles.meta}>{result.company.name}</span>
                )}
                <span className={styles.meta}>{result.status}</span>
              </>
            ) : (
              <>
                <span className={styles.meta}>
                  {(result as Interaction).parties?.[0]?.identity?.name}
                </span>
                <span className={styles.meta}>
                  Updated {dayjs((result as Interaction).updatedAt).fromNow()}
                </span>
              </>
            )}
          </div>
        </div>
      </button>
    </li>
  );
};
