import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import {
  AppBar,
  Button,
  ButtonGroup,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid,
  IconButton,
  Paper,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { Exercise } from '../domain/types';
import CountdownTimer from './CountdownTimer';
import VideoCard from './VideoCard';

interface RunExerciseDialogProps {
  exercise?: Exercise;
  open: boolean;
  handleClose: () => void;
  handleFinish: (id: string | undefined) => void;
}

const RunExerciseDialog: React.FC<RunExerciseDialogProps> = ({ open, exercise, handleClose, handleFinish }) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [series, setSeries] = React.useState(0);

  React.useEffect(() => {
    if (open) {
      setSeries(0);
    }
  }, [open]);

  return (
    <Dialog fullScreen={isMobile} fullWidth maxWidth="md" open={open} onClose={handleClose}>
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
            {exercise?.name}
          </Typography>
        </Toolbar>
      </AppBar>
      <DialogContent sx={{ padding: 3 }}>
        <DialogContentText sx={{ mb: 2 }}>{exercise?.instructions}</DialogContentText>

        <Grid container spacing={2} alignItems="center">
          {/* Progresso de Carga */}
          <Grid item xs={12}>
            <Typography variant="body1">
              <strong>Progreção de carga:</strong> {exercise?.load_progress ? 'SIM' : 'Não'}
            </Typography>
          </Grid>

          {/* Controle de Séries */}
          <Grid item xs={12} sm={6} display="flex" alignItems="center">
            <Typography variant="body1" sx={{ mr: 2 }}>Séries:</Typography>
            <Chip label={`${series} / ${exercise?.series}`} sx={{ fontSize: 16, padding: 1 }} />
            <ButtonGroup sx={{ ml: 2 }}>
              <Button
                aria-label="reduce"
                onClick={() => setSeries(Math.max(series - 1, 0))}
                disabled={series === 0}
              >
                <RemoveIcon fontSize="small" />
              </Button>
              <Button
                aria-label="increase"
                onClick={() => setSeries(Math.min(series + 1, exercise?.series ?? 1))}
                disabled={series >= (exercise?.series ?? 1)}
              >
                <AddIcon fontSize="small" />
              </Button>
            </ButtonGroup>
          </Grid>

          {/* Carga do Exercício */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Carga (KG)"
              type="number"
              variant="outlined"
              value={exercise?.load}
              inputProps={{ min: 0 }}
            />
          </Grid>
        </Grid>

        {/* Timer e Vídeo */}
        <Grid container spacing={2} mt={3}>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
              <CountdownTimer rest={exercise?.rest ?? 60} />
            </Paper>
          </Grid>
          {exercise?.video && (
            <Grid item xs={12} sm={6}>
              <VideoCard url={exercise.video} />
            </Grid>
          )}
        </Grid>
      </DialogContent>

      {/* Botões de Ação */}
      <DialogActions sx={{ justifyContent: 'space-between', padding: 2 }}>
        <Button color="inherit" onClick={handleClose}>Fechar</Button>
        <Button
          disabled={series !== (exercise?.series ?? 1)}
          onClick={() => handleFinish(exercise?.id)}
          variant="contained"
          color="primary"
        >
          Concluir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RunExerciseDialog;
