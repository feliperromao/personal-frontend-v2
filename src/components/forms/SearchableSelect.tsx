import React, { useState } from "react";
import { Autocomplete, TextField } from "@mui/material";

interface Option {
  label: string;
  value: string;
}
interface SearchableSelectProps {
  options: Option[],
  value: Option | undefined;
  onChange: (value: any) => void;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange }) => {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.label}
      value={value}
      onChange={(_, newValue) => {
        setSelectedOption(newValue)
        onChange(newValue)
      }}
      renderInput={(params) => <TextField {...params} label="Aluno" variant="outlined" />}
      fullWidth
    />
  );
};

export default SearchableSelect;
