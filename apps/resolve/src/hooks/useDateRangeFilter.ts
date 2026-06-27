import { useSearchParams } from "react-router-dom";

export function useDateRangeFilter() {
  const [searchParams, setSearchParams] = useSearchParams();

  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  function setValue(start: string, end: string) {
    const params = new URLSearchParams(searchParams);

    if (start) {
      params.set("startDate", start);
    } else {
      params.delete("startDate");
    }

    if (end) {
      params.set("endDate", end);
    } else {
      params.delete("endDate");
    }

    setSearchParams(params);
  }

  function clear() {
    const params = new URLSearchParams(searchParams);
    params.delete("startDate");
    params.delete("endDate");
    setSearchParams(params);
  }

  return {
    startDate,
    endDate,
    setValue,
    clear,
  };
}