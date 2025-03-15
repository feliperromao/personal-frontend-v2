import React from 'react';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  fabButton: {
    position: 'fixed',
    bottom: 64,
    right: 16,
  },
});

interface FloatingButtonProps {
  onClick: () => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick }) => {
  const defaultClasses = useStyles();

  return (
    <Fab 
      color="primary" 
      aria-label="add" 
      className={ defaultClasses.fabButton }
      onClick={onClick}
      style={{position: 'fixed'}}
    >
      <AddIcon />
    </Fab>
  );
};

export default FloatingButton;
