import React from 'react';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  fabButton: {
    position: 'fixed',
    bottom: 25,
    right: 16,
  },
});

interface AddButtonProps {
  onClick: () => void;
}

const AddButton: React.FC<AddButtonProps> = ({ onClick }) => {
  const defaultClasses = useStyles();

  return (
    <Fab 
      color="primary" 
      aria-label="add" 
      className={defaultClasses.fabButton}
      onClick={onClick}
      style={{position: 'fixed'}}
    >
      <AddIcon />
    </Fab>
  );
};

export default AddButton;
