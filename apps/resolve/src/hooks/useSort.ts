import { useSearchParams } from "react-router-dom";

const PARAM = "sortBy";

export function useSort() {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(PARAM);

  function setValue(
    nextSort: string,
  ) {
    const params = new URLSearchParams(searchParams);
    // remove existing sort
    params.delete(PARAM);

    // add next sort
    params.append(PARAM, nextSort);
  
    // reset results to first page
    params.set("page", String(1));

    setSearchParams(params);
  }

  function clear() {
    const params = new URLSearchParams(searchParams);
    params.delete(PARAM);
    setSearchParams(params);
  }

  return {
    value,
    setValue,
    clear,
  };

}
