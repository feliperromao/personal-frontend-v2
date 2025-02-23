import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Input } from '@mui/material';
import React from 'react'
import { Exercise } from '../domain/types';
import CountdownTimer from './CountdownTimer';

interface RunExerciseDialogProps {
  exercise?: Exercise
  open: boolean;
  handleClose: () => void;
}

const RunExerciseDialog: React.FC<RunExerciseDialogProps> = ({ open, exercise, handleClose }) => {
  return (
    <Dialog
      fullWidth={true}
      maxWidth="md"
      open={open}
      onClose={() => { }}
    >
      <DialogTitle>{exercise?.name}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {exercise?.instructions}
        </DialogContentText>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <DialogContentText>
              - Series: {exercise?.series}
            </DialogContentText>
            <DialogContentText>
              - Progreção de carga: {exercise?.load_progress ? 'SIM': 'Não'}
            </DialogContentText>
          </Grid>
          <Grid item xs={12} md={6}>
            <CountdownTimer rest={exercise?.rest ?? 60} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Fechar</Button>
        <Button variant="contained" onClick={handleClose}>Concluir</Button>
      </DialogActions>
    </Dialog>
  )
}

export default RunExerciseDialog;