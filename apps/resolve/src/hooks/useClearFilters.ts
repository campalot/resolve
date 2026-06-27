import { useSearchParams } from "react-router-dom";

export function useClearFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageSize = searchParams.get("pageSize");

  function clear() {
    setSearchParams({ pageSize: pageSize || String(10), page: String(1) });
  }

  return {
    clear,
  };

}
