import { useUrlFilter } from "../../hooks/useUrlFilter";
import { FilterAutocomplete } from "./FilterAutocomplete";

type PartiesFilterProps = {
  options: {
    id: string;
    name: string;
  }[];
};

export const PartiesFilter = ({ options }: PartiesFilterProps) => {
  const { value, setValue } = useUrlFilter("partyId");
  return (
    <FilterAutocomplete
      label="Parties"
      options={options}
      selectedValues={value}
      onChange={setValue}
      getOptionValue={(p) => p.id} // Use the ID for the URL
      getOptionDisplay={(p) => p.name} // Use the Name for the UI
    />
  );
};
