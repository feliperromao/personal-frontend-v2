import * as React from 'react';
import {
  AppBar, Checkbox, Dialog, IconButton, InputAdornment, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Slide, TextField, Toolbar, Typography, CircularProgress, Pagination, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { TransitionProps } from 'notistack';
import SearchIcon from "@mui/icons-material/Search";
import { GridCloseIcon } from "@mui/x-data-grid";
import { Exercise, exerciseCategories } from '../../domain/types';
import api from '../../pages/@shared/api';
const URL = '/exercises';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<unknown> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface SelectExercisesProps {
  isOpen: boolean;
  handleClose: () => void;
  addExercise: (item: Exercise) => void;
  removeExercise: (item: Exercise) => void;
}

const SelectExercises: React.FC<SelectExercisesProps> = ({ isOpen, handleClose, addExercise, removeExercise }) => {
  const [exercises, setExercises] = React.useState<Exercise[]>([]);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [search, setSearch] = React.useState<string>('');
  const [checked, setChecked] = React.useState<string[]>([]);
  const [typeFilter, setTypeFilter] = React.useState<string>('');
  const [exerciseTypes, setExerciseTypes] = React.useState<string[]>([]);

  React.useEffect(() => {
    fetchExercises();
  }, [currentPage, search, typeFilter]);

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

  return (
    <Dialog fullScreen open={isOpen} onClose={handleClose} TransitionComponent={Transition}>
      <AppBar color="primary" sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
            <GridCloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
            Exercícios
          </Typography>
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
            sx={{ backgroundColor: 'white', borderRadius: 1, ml: 2 }}
          />
          <FormControl size="small" sx={{ ml: 2, minWidth: 150, backgroundColor: 'white', borderRadius: 1 }}>
            <Select
              variant='outlined'
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              displayEmpty
            >
              <MenuItem value="">Todos</MenuItem>
              {exerciseCategories.map((type) => (
                <MenuItem key={type.name} value={type.name}>{type.type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>
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
        </>
      )}
    </Dialog>
  );
};

export default SelectExercises;
