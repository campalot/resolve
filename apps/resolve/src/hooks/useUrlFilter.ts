import { useSearchParams } from "react-router-dom";

type FilterKey = "status" | "type" | "partyId";

export type UseUrlFilterResult = {
  value: string[]; 
  setValue: (nextValues: string[]) => void;
  clear: () => void;
};

export function useUrlFilter(paramKey: FilterKey) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const value = searchParams.getAll(paramKey);

  const setValue = (nextValues: string[]) => {
    const params = new URLSearchParams(searchParams);
    
    params.delete(paramKey);
    
    nextValues.forEach((v) => {
      if (v.trim()) params.append(paramKey, v);
    });

    params.set("page", "1");
    setSearchParams(params);
  };

  const clear = () => {
    const params = new URLSearchParams(searchParams);
    params.delete(paramKey);
    setSearchParams(params);
  };

  return { value, setValue, clear };
}