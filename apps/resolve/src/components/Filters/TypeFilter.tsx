import { useUrlFilter } from "../../hooks/useUrlFilter";
import { FilterAutocomplete } from "./FilterAutocomplete";

export const TypeFilter = ({ options }: { options: string[] }) => {
  const { value, setValue } = useUrlFilter("type");
  return (
    <FilterAutocomplete
      label="Types"
      options={options}
      selectedValues={value}
      onChange={setValue}
      getOptionValue={(s) => s} // The string is the value
      getOptionDisplay={(s) => s.charAt(0).toUpperCase() + s.slice(1)} // Capitalize
    />
  );
};