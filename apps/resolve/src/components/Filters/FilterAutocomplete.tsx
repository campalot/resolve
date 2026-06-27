import { Autocomplete, TextField } from "@mui/material";
import styles from "./FilterAutocomplete.module.scss";

interface FilterAutocompleteProps<T> {
  label: string;
  options: T[];
  selectedValues: string[]; // These are always the string IDs/values from the URL
  onChange: (next: string[]) => void;
  getOptionValue: (option: T) => string; // How to get the "id" or "code"
  getOptionDisplay: (option: T) => string; // How to get the "Label"
}

export function FilterAutocomplete<T>({
  label,
  options,
  selectedValues,
  onChange,
  getOptionValue,
  getOptionDisplay,
}: FilterAutocompleteProps<T>) {
  // Find the objects that match the strings in our URL
  const selectedOptions = options.filter((o) =>
    selectedValues.includes(getOptionValue(o).toLowerCase()),
  );

  return (
    <Autocomplete
      multiple
      options={options}
      size="small"
      className={styles.selectContainer}
      // Use the display function provided by the parent
      getOptionLabel={getOptionDisplay}
      // Use the value function provided by the parent
      getOptionKey={(option) => getOptionValue(option).toLowerCase()}
      value={selectedOptions}
      onChange={(_, next) => {
        // Map the selected objects back to strings for the URL
        onChange(next.map((o) => getOptionValue(o).toLowerCase()));
      }}

      slotProps={{
        popper: { sx: { width: "fit-content" }, placement: "bottom-start" },
        paper: { sx: { width: "fit-content", minWidth: "100%" } },
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} className={styles.input} />
      )}
      limitTags={2}
      aria-multiselectable="true"
    />
  );
}