import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';

const ignoredParams = ['page', 'pageSize'];

export const useHasActiveFilters = () => {
  const [searchParams] = useSearchParams();

  const hasActiveFilters = useMemo(() => {
    // Convert searchParams to a plain object
    const allParams = Object.fromEntries(searchParams.entries());

    // Create a new object with only the filter parameters (excluding ignored ones)
    const filterParams = Object.keys(allParams)
      .filter(key => !ignoredParams.includes(key))
      .reduce<Record<string, string>>((obj, key) => {
        obj[key] = allParams[key];
        return obj;
      }, {});

    // Check if the filtered object has any keys
    return Object.keys(filterParams).length > 0;
  }, [searchParams]); // Re-run the calculation when searchParams change

  return hasActiveFilters;
};

