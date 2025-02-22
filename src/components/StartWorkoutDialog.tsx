import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { Training } from '../domain/types';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface StartWorkoutDialogProps {
  open: boolean;
  training?: Training
  handleClose: () => void;
}

const StartWorkoutDialog: React.FC<StartWorkoutDialogProps> = ({ open, training, handleClose }) => {

  return (
    <React.Fragment>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {training?.name}
            </Typography>
            <Button autoFocus color="inherit" onClick={() => { }}>
              iniciar treino
            </Button>
          </Toolbar>
        </AppBar>
        <List>
          {training?.exercises.map(exercise => (
            <>
              <ListItemButton>
                <ListItemText primary={exercise.name} secondary={exercise.instructions} />
              </ListItemButton>
              <Divider />
            </>
          ))}
        </List>
      </Dialog>
    </React.Fragment>
  );
}

export default StartWorkoutDialog;