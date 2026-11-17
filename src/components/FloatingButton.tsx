import React from 'react';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface FloatingButtonProps {
  onClick: () => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick }) => {
  return (
    <Fab 
      color="primary" 
      aria-label="Adicionar"
      onClick={onClick}
      sx={{ position: 'fixed', right: 16, bottom: { xs: 'calc(var(--app-bottom-nav) + env(safe-area-inset-bottom) + 16px)', md: 24 }, zIndex: 10 }}
    >
      <AddIcon />
    </Fab>
  );
};

export default FloatingButton;
