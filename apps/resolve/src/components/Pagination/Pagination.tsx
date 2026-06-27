import CaretLeft from "../../assets/icon-caret-left.svg?react";
import CaretRight from "../../assets/icon-caret-right.svg?react";
import styles from "./Pagination.module.scss";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isCards?: boolean;
};

const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  isCards = false,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageSizeOptions = isCards ? [6, 12, 18] : [5, 10, 20];

  return (
    <nav className={styles.pagination} aria-label="Table pagination">
      <label htmlFor="page-size">{isCards ? "Cards" : "Rows"} per page</label>
      <select
        id="page-size"
        value={pageSize}
        onChange={(e) => {
          onPageSizeChange(Number(e.target.value));
        }}
      >
        {pageSizeOptions.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>

      <div className={styles.pages}>
        <span aria-label="Page number" aria-live="polite" aria-atomic="true" data-testid="batch-items">
          {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of{" "}
          {total}
        </span>

        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          aria-disabled={page === 1}
          aria-label="Go to previous page"
          className={`${styles.pageButton} ${styles.pageButtonLeft} ${page === 1 ? styles.disabled : ""}`}
        >
          <CaretLeft />
        </button>

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-disabled={page === totalPages}
          aria-label="Go to next page"
          className={`${styles.pageButton} ${styles.pageButtonRight} ${page === totalPages ? styles.disabled : ""}`}
        >
          <CaretRight />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
