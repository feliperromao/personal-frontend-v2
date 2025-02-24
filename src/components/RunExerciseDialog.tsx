import { Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Input, Paper, Stack, TextField, Typography } from '@mui/material';
import React from 'react'
import { Exercise } from '../domain/types';
import CountdownTimer from './CountdownTimer';
import VideoCard from './VideoCard';
import { Container, Row } from './Grid';

interface RunExerciseDialogProps {
  exercise?: Exercise
  open: boolean;
  handleClose: () => void;
}

const RunExerciseDialog: React.FC<RunExerciseDialogProps> = ({ open, exercise, handleClose }) => {
  const [series, setSeries] = React.useState(0);
  
  return (
    <Dialog
      fullWidth={true}
      maxWidth="md"
      open={open}
      onClose={() => { }}
    >
      <DialogTitle>
        <Typography variant="h5" align="center">
          {exercise?.name}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {exercise?.instructions}
        </DialogContentText>
        <DialogContentText mt={1}>
          Progreção de carga: {exercise?.load_progress ? 'SIM' : 'Não'}
        </DialogContentText>
        <DialogContentText mt={1}>
          Series: <Chip label={`${series} / ${exercise?.series}`} />
        </DialogContentText>
        <DialogContentText mt={2}>
          <TextField
            label="Carga (KG)"
            type="number"
            variant="outlined"
            value={exercise?.load}
          />
        </DialogContentText>

        <Container spacing={3} mt={1}>
          <Row md={6}>
            <Paper>
              <CountdownTimer rest={exercise?.rest ?? 60} />
            </Paper>
          </Row>
          <Row md={6}>
            <VideoCard videoId="qyW8hCaCxsw" />
          </Row>
        </Container>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Fechar</Button>
        <Button variant="contained" onClick={handleClose}>Concluir</Button>
      </DialogActions>
    </Dialog>
  )
}

export default RunExerciseDialog;