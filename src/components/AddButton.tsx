import React from 'react';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface AddButtonProps {
  onClick: () => void;
}

const AddButton: React.FC<AddButtonProps> = ({ onClick }) => {
  return (
    <Fab 
      color="primary" 
      aria-label="Adicionar"
      onClick={onClick}
      sx={{ position: 'fixed', right: 16, bottom: { xs: 'calc(var(--app-bottom-nav) + env(safe-area-inset-bottom) + 16px)', md: 25 }, zIndex: 10 }}
    >
      <AddIcon />
    </Fab>
  );
};

export default AddButton;
