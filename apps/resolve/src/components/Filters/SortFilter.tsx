import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useSort } from "../../hooks/useSort";

export type SortOption = {
  label: string;
  value: string | number;
};
type SortProps = {
  options: SortOption[];
};

export const SortFilter: React.FC<SortProps> = ({ options }) => {
  const { value, setValue } = useSort();

  const handleChange = (event: SelectChangeEvent) => {
    setValue(event.target.value);
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 120, margin: 0 }} size="small">
      <InputLabel id="demo-select-small-label">Sort</InputLabel>
      <Select
        labelId="demo-select-small-label"
        id="demo-select-small"
        aria-label="Sort interactions"
        value={value || ""}
        label="Sort"
        onChange={handleChange}
        sx={{ background: "#fff" }}
      >
        {options.map((option: SortOption) => {
          return (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};
