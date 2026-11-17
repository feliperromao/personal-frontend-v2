import * as React from 'react';
import {
  Box, Checkbox, Dialog, IconButton, InputAdornment, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Slide, TextField, Typography, CircularProgress, Pagination, MenuItem, Select, FormControl, Stack
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import SearchIcon from "@mui/icons-material/Search";
import { GridCloseIcon } from "@mui/x-data-grid";
import { Exercise, ExerciseInput, exerciseCategories } from '../../domain/types';
import api from '../@shared/api';
import AddButton from '../../components/AddButton';
import ExerciseForm from './ExerciseForm';
import { handleOpenNotification, SNACKBAR_TYPES } from '../../components/MySnackbar';
const URL = '/exercises';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<unknown> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface SelectExercisesProps {
  isOpen: boolean;
  selected?: Exercise[];
  handleClose: () => void;
  addExercise: (item: Exercise) => void;
  removeExercise: (item: Exercise) => void;
}

const SelectExercises: React.FC<SelectExercisesProps> = ({ isOpen, selected, handleClose, addExercise, removeExercise }) => {
  const [exercises, setExercises] = React.useState<Exercise[]>([]);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [search, setSearch] = React.useState<string>('');
  const [checked, setChecked] = React.useState<string[]>([]);
  const [typeFilter, setTypeFilter] = React.useState<string>('');
  const [showExerciseModal, setShowExerciseModal] = React.useState(false);

  React.useEffect(() => {
    fetchExercises();
    if (selected?.length) {
      const ids = selected?.map(item => item.id)
      setChecked(ids)
    }
  }, [currentPage, search, typeFilter, selected]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const response = await api.get(URL, {
        params: { page: currentPage, search, exercise_type: typeFilter },
      });
      setExercises(response.data.data);
      setTotalPages(Math.ceil(response.data.total_documents / response.data.per_page));
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (value: string) => () => {
    setChecked((prevChecked) =>
      prevChecked.includes(value)
        ? prevChecked.filter((id) => id !== value)
        : [...prevChecked, value]
    );

    const wasChecked = checked.includes(value);
    const exercise = exercises.find(item => item.id === value);
    if (exercise) {
      wasChecked ? removeExercise(exercise) : addExercise(exercise);
    }
  };

  const handleOpenModalExercises = () => {
    setShowExerciseModal(true)
  }

  const handleCloseModalExercises = () => {
    setShowExerciseModal(false)
  }

  const handleSaveExercise = async (exercise: ExerciseInput) => {
    await api.post(URL,
      {
        name: exercise.name,
        type: exercise.type,
        instructions: exercise.instructions,
        video: exercise.video,
        rest: exercise.rest,
        load: exercise.load,
        series: exercise.series,
        load_progress: exercise.load_progress,
      }).then(async (result) => {
        await fetchExercises();
        handleCloseModalExercises();
        handleOpenNotification("Exercício cadastrado com sucesso!", SNACKBAR_TYPES.success);
        const exercise: Exercise = result.data.data
        setChecked([...checked, exercise.id])
        addExercise(exercise)
      }).catch(() => {
        handleOpenNotification("Falha ao cadastrar exercício", SNACKBAR_TYPES.error);
      })
  }

  return (
    <Dialog fullScreen open={isOpen} onClose={handleClose} TransitionComponent={Transition}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', p: 2, pt: 'calc(16px + env(safe-area-inset-top))' }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
          <IconButton edge="start" onClick={handleClose} aria-label="Fechar seletor de exercícios">
            <GridCloseIcon />
          </IconButton>
          <Typography variant="h5">Adicionar exercícios</Typography>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            variant="outlined"
            placeholder="Pesquisar..."
            size="small"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            fullWidth
            inputProps={{ 'aria-label': 'Pesquisar exercícios' }}
          />
          <FormControl size="small" sx={{ minWidth: { sm: 190 } }}>
            <Select
              variant='outlined'
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              displayEmpty inputProps={{ 'aria-label': 'Filtrar por grupo muscular' }}
            >
              <MenuItem value="">Todos</MenuItem>
              {exerciseCategories.map((type) => (
                <MenuItem key={type.name} value={type.name}>{type.type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>
      {loading ? (
        <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 3 }} />
      ) : (
        <>
          <List>
            {exercises.map((exercise) => (
              <ListItem key={exercise.id}>
                <ListItemButton onClick={handleToggle(exercise.id)} dense>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={checked.includes(exercise.id)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography sx={{ fontWeight: 800 }}>{exercise.name}</Typography>}
                    secondary={<Typography sx={{ fontSize: '0.8em' }}>Séries: {exercise.series} - {exercise.instructions}</Typography>}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, value) => setCurrentPage(value)}
            sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}
          />
          <ExerciseForm
            exercise={undefined}
            isOpen={showExerciseModal}
            onSubmit={handleSaveExercise}
            handleClose={handleCloseModalExercises} />
          <AddButton onClick={handleOpenModalExercises} />
        </>
      )}
    </Dialog>
  );
};

export default SelectExercises;
