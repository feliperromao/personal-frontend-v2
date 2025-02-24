import * as React from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';

interface SearchInputProps {
  handleChange: (value: string) => void;
  handleSearch: () => void;
  append?: React.ReactNode
}

const SearchInput: React.FC<SearchInputProps> = ({ handleChange, handleSearch, append }) => {

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    handleChange(value);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  }

  return (
    <Paper
      component="form"
      sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 600 }}
      onSubmit={onSubmit}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Pesquisar"
        inputProps={{ 'aria-label': 'pesquisar' }}
        onChange={onChange}
      />
      <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={handleSearch}>
        <SearchIcon />
      </IconButton>
      {append}
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      <IconButton color="inherit" sx={{ p: '10px' }} aria-label="directions">
        <DeleteIcon />
      </IconButton>
    </Paper>
  );
}
export default SearchInput;