import * as React from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

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
      sx={{ p: 0.75, display: 'flex', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: 0.5, alignItems: 'center', width: '100%', maxWidth: 760, border: 1, borderColor: 'divider' }}
      onSubmit={onSubmit}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Pesquisar por nome"
        inputProps={{ 'aria-label': 'Pesquisar por nome' }}
        onChange={onChange}
      />
      <IconButton type="submit" sx={{ p: '10px' }} aria-label="Executar pesquisa">
        <SearchIcon />
      </IconButton>
      {append}
    </Paper>
  );
}
export default SearchInput;
