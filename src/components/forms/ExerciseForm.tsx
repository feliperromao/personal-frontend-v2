import React, { useState, useEffect } from 'react';
import { Exercise } from '../../domain/types';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, TextField } from '@mui/material';

interface UserFormProps {
  exercise?: Exercise | null;
  isOpen: boolean;
  onSubmit: (exercise: Exercise) => void;
  handleClose: () => void;
}

const ExerciseForm: React.FC<UserFormProps> = ({ exercise, isOpen, onSubmit, handleClose }) => {
  const [formData, setFormData] = useState<Exercise>({
    name: '',
    instructions: '',
    video: '',
    rest: 30,
    load: 0,
    series: 4,
    load_progress: false
  });

  useEffect(() => {
    if (exercise) {
      setFormData(exercise);
    }
  }, [exercise]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    switch(name){
      case "rest":
      case "load":
      case "series":
        return setFormData((prev) => ({ ...prev, [name]: convertToNumber(value) }));
      default:
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleChangeCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const convertToNumber = (value: string): number => {
    return +value
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          onSubmit(formData);
          setFormData({ name: '', instructions: '', video: '', rest: 30, load: 0, series: 0, load_progress: false });
          handleClose();
        },
      }}
    >
      <DialogTitle>Cadastro de exercícios</DialogTitle>
      <DialogContent>
        <TextField
          required
          margin="dense"
          id="name"
          name="name"
          label="Nome"
          fullWidth
          variant="outlined"
          value={formData.name}
          onChange={handleChange}
        />
        <TextField
          required
          margin="dense"
          id="instructions"
          name="instructions"
          label="Instruções"
          fullWidth
          variant="outlined"
          value={formData.instructions}
          onChange={handleChange}
        />
        <TextField
          required
          margin="dense"
          id="video"
          name="video"
          label="URL do video"
          fullWidth
          variant="outlined"
          value={formData.video}
          onChange={handleChange}
        />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              required
              margin="dense"
              type="number"
              id="rest"
              name="rest"
              label="Descanço (segundos)"
              fullWidth
              variant="outlined"
              value={formData.rest}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              required
              margin="dense"
              type="number"
              id="load"
              name="load"
              label="Carga (kg/placas)"
              fullWidth
              variant="outlined"
              value={formData.load}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              required
              type="number"
              id="series"
              name="series"
              label="Séries"
              fullWidth
              variant="outlined"
              value={formData.series}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              label="Progressão de carga"
              control={
                <Checkbox
                id="load_progress"
                name="load_progress"
                defaultChecked
                value={formData.load_progress}
                onChange={handleChangeCheckbox} />
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button type="submit">{exercise ? 'Editar' : 'Criar'} exercício</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExerciseForm;
