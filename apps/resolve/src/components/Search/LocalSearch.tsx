import React from "react";
import { useSearchParams } from "react-router-dom";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

const PARAM_QUERY = "q";

type LocalSearchProps = {
  placeholder?: string;
};

const LocalSearch: React.FC<LocalSearchProps> = ({ placeholder }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(PARAM_QUERY);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);
    // remove existing search query
    params.delete(PARAM_QUERY);
    // add updated search query
    params.append(PARAM_QUERY, event.target.value);
    // reset results to first page
    params.set("page", String(1));

    setSearchParams(params);
  };

  return (
    <TextField
      label="Search"
      aria-label={placeholder}
      placeholder={placeholder}
      variant="outlined"
      size="small"
      value={value ?? ""}
      onChange={handleSearch}
      sx={{ background: "#fff" }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default LocalSearch;
