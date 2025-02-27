import React from 'react';
import { Fab, useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  fabButton: {
    position: 'fixed',
    bottom: 16,
    right: 16,
  },
});

const useStylesUpper = makeStyles({
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
  const isMobile = useMediaQuery('(max-width:600px)');
  const defaultClasses = useStyles();
  const classesUpperButton = useStylesUpper();

  return (
    <Fab 
      color="primary" 
      aria-label="add" 
      className={ !isMobile ? defaultClasses.fabButton : classesUpperButton.fabButton}
      onClick={onClick}
      style={{position: 'fixed'}}
    >
      <AddIcon />
    </Fab>
  );
};

export default FloatingButton;
