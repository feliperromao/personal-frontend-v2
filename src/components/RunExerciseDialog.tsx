import React from 'react'
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Button, ButtonGroup, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Input, Paper, Stack, TextField, Typography } from '@mui/material';
import { Exercise } from '../domain/types';
import CountdownTimer from './CountdownTimer';
import VideoCard from './VideoCard';
import { Container, Row } from './Grid';

interface RunExerciseDialogProps {
  exercise?: Exercise
  open: boolean;
  handleClose: () => void;
  handleFinish: (id: string | undefined) => void;
}

const RunExerciseDialog: React.FC<RunExerciseDialogProps> = ({ open, exercise, handleClose, handleFinish }) => {
  const [series, setSeries] = React.useState(0);

  React.useEffect(() => {
    if (open) {
      setSeries(0);
    }
  }, [open]);

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
        <DialogContentText mb={1}>
          {exercise?.instructions}
        </DialogContentText>
        <Container spacing={3}>
          <Row md={6}>
            <DialogContentText>
              Progreção de carga: {exercise?.load_progress ? 'SIM' : 'Não'}
            </DialogContentText>
            <DialogContentText mt={1}>
              Series: <Chip label={`${series} / ${exercise?.series}`} />
              <ButtonGroup sx={{ position: 'relative', marginLeft: 2 }}>
                <Button
                  aria-label="reduce"
                  onClick={() => {
                    setSeries(Math.max(series - 1, 0));
                  }}
                >
                  <RemoveIcon fontSize="small" />
                </Button>
                <Button
                  disabled={series >= (exercise?.series ?? 1)}
                  aria-label="increase"
                  onClick={() => {
                    setSeries(series + 1);
                  }}
                >
                  <AddIcon fontSize="small" />
                </Button>
              </ButtonGroup>
            </DialogContentText>
          </Row>
          <Row md={6}>
            <TextField
              fullWidth
              label="Carga (KG)"
              type="number"
              variant="outlined"
              value={exercise?.load}
            />
          </Row>
        </Container>
        <Container spacing={3} mt={1}>
          <Row md={6}>
            <Paper>
              <CountdownTimer rest={exercise?.rest ?? 60} />
            </Paper>
          </Row>
          {exercise?.video ? (
            <Row md={6}>
              <VideoCard url={exercise?.video} />
            </Row>
          ) : null}
        </Container>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose}>Fechar</Button>
        <Button
          disabled={series !== (exercise?.series ?? 1)}
          onClick={() => handleFinish(exercise?.id)}
          variant="contained"
        >Concluir</Button>
      </DialogActions>
    </Dialog>
  )
}

export default RunExerciseDialog;