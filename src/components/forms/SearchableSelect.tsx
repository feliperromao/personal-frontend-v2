import React, { useState } from "react";
import { Autocomplete, TextField } from "@mui/material";

interface SearchableSelectProps {
  options: Option[],
  value: Option | undefined;
}

interface Option {
  label: string;
  value: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value }) => {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.label}
      value={value}
      onChange={(_, newValue) => setSelectedOption(newValue)}
      renderInput={(params) => <TextField {...params} label="Aluno" variant="outlined" />}
      fullWidth
    />
  );
};

export default SearchableSelect;
