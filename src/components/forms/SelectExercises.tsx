import * as React from 'react';
import { GridCloseIcon, GridColDef } from '@mui/x-data-grid';
import Checkbox from '@mui/material/Checkbox';
import axios from 'axios';
import { AppBar, Button, Dialog, Divider, IconButton, InputAdornment, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Slide, TextField, Toolbar, Typography } from '@mui/material';
import { TransitionProps } from 'notistack';
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
const URL = `${process.env.REACT_APP_BACKEND_GRAPH_API}/exercises`;
const token = localStorage.getItem('auth-token');

interface ExercisesItem {
  id: string,
  name: string,
  instructions: string,
  series: number
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface SelectExercisesProps {
  isOpen: boolean,
  handleClose: () => {},
  handleSave: (itens: any) => {},
}

const SelectExercises: React.FC<SelectExercisesProps> = ({ isOpen, handleClose, handleSave }) => {
  const [exercises, setExercises] = React.useState<ExercisesItem[]>([]);
  const [currentPage, setCurrentPage] = React.useState<number>(0);
  const [rowCount, setRowCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [search, setSearch] = React.useState<string>('');
  const [checked, setChecked] = React.useState<string[]>([]);
  const [debouncedSearch, setDebouncedSearch] = React.useState<string>("");

  React.useEffect(() => {
    fetchExercises();
  }, [currentPage]);

  const handleSubmit = () => {
    const selectedExercises = [];
    for (let item of exercises) {
      if (checked.includes(item.id)) {
        selectedExercises.push(item)
      }
    }
    handleSave(selectedExercises);
    handleClose();
  }

  const fetchExercises = async () => {
    const page = currentPage + 1
    try {
      setLoading(true);
      const response = await axios.get(`${URL}?page=${page}&search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExercises(response.data.data);
      setRowCount(response.data.total_documents);
    } finally {
      setLoading(false);
    }
  }

  const handleToggle = (value: string) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleClear = () => {
    setSearch("");
  }

  return (
    <Dialog
      fullScreen
      open={isOpen}
      onClose={() => handleClose()}
      TransitionComponent={Transition}
    >
      <AppBar color="secondary" sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => handleClose()}
            aria-label="close"
          >
            <GridCloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Exercicios
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
            sx={{ backgroundColor: "white", borderRadius: 1, ml: 2 }}
          />
          <Button autoFocus color="inherit" onClick={() => handleSubmit()}>
            Salvar
          </Button>
        </Toolbar>
      </AppBar>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {exercises.map((exercise) => {
          const labelId = `checkbox-list-label-${exercise.id}`;
          return (
            <ListItem
              key={exercise.id}
            >
              <ListItemButton role={undefined} onClick={handleToggle(exercise.id)} dense>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={checked.includes(exercise.id)}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId }}
                  />
                </ListItemIcon>
                <ListItemText
                  id={labelId}
                  primary={<Typography sx={{ fontWeight: 800 }}>{exercise.name}</Typography>}
                  secondary={<Typography sx={{ fontWeight: 200, fontSize: "0.8em" }}>Series:{exercise.series} - {exercise.instructions}</Typography>}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Dialog>
  );
}
export default SelectExercises