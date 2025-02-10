import * as React from 'react';
import {
  AppBar, Checkbox, Dialog, IconButton, InputAdornment, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Slide, TextField, Toolbar, Typography, CircularProgress, Pagination
} from '@mui/material';
import { TransitionProps } from 'notistack';
import SearchIcon from "@mui/icons-material/Search";
import { GridCloseIcon } from "@mui/x-data-grid";
import axios from 'axios';
import { Exercise } from '../../domain/types';
const URL = `${process.env.REACT_APP_BACKEND_GRAPH_API}/exercises`;
const token = localStorage.getItem('auth-token');

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

  React.useEffect(() => {
    fetchExercises();
  }, [currentPage, search]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${URL}`, {
        params: { page: currentPage, search },
        headers: { Authorization: `Bearer ${token}` },
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

    const wasChecked = checked.includes(value)
    const exercise = exercises.find(item => item.id === value)
    if (exercise) {
      wasChecked ? removeExercise(exercise) : addExercise(exercise)
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  return (
    <Dialog fullScreen open={isOpen} onClose={handleClose} TransitionComponent={Transition}>
      <AppBar color="secondary" sx={{ position: 'relative' }}>
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
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ backgroundColor: 'white', borderRadius: 1, ml: 2 }}
          />
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
