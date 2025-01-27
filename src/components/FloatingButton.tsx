import React from 'react';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  fabButton: {
    position: 'fixed',
    bottom: 16,
    right: 16,
  },
});

interface FloatingButtonProps {
  onClick: () => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick }) => {
  const classes = useStyles();

  return (
    <Fab 
      color="primary" 
      aria-label="add" 
      className={classes.fabButton}
      onClick={onClick}
      style={{position: 'fixed'}}
    >
      <AddIcon />
    </Fab>
  );
};

export default FloatingButton;
