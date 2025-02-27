import React, { useState, useEffect } from 'react';
import { Exercise } from '../../domain/types';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, TextField, useMediaQuery } from '@mui/material';
import ExerciseType from './Select/ExerciseType';

interface UserFormProps {
  exercise?: Exercise | null;
  isOpen: boolean;
  onSubmit: (exercise: Exercise) => void;
  handleClose: () => void;
}

const ExerciseForm: React.FC<UserFormProps> = ({ exercise, isOpen, onSubmit, handleClose }) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [formData, setFormData] = useState<Exercise>({
    id: '',
    name: '',
    type: '',
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
    } else {
      setFormData({
        id: '',
        name: '',
        type: '',
        instructions: '',
        video: '',
        rest: 30,
        load: 0,
        series: 4,
        load_progress: false
      })
    }
  }, [exercise]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    switch (name) {
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

  const setExerciseType = (type: string) => {
    setFormData((prev) => ({ ...prev, type: type }));
  }

  const convertToNumber = (value: string): number => {
    return +value
  }

  return (
    <Dialog
      fullScreen={isMobile}
      open={isOpen}
      onClose={handleClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          onSubmit(formData);
          setFormData({ id: '', name: '', type: '', instructions: '', video: '', rest: 30, load: 0, series: 0, load_progress: false });
          handleClose();
        },
      }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        Cadastro de exercícios
      </DialogTitle>

      <DialogContent sx={{paddingTop: '20px!important'}}>
        <Grid container spacing={1}>
          <Grid item xs={12} md={6}>
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
          </Grid>
          <Grid item xs={12} md={6}>
            <ExerciseType value={formData.type} onChange={setExerciseType} />
          </Grid>
        </Grid>

        <TextField
          id="instructions"
          name="instructions"
          label="Instruções"
          multiline
          fullWidth
          rows={4}
          margin="dense"
          value={formData.instructions}
          onChange={handleChange}
        />
        <TextField
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
                  value={formData.load_progress}
                  checked={formData.load_progress}
                  onChange={handleChangeCheckbox} />
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button color='inherit' onClick={handleClose}>Cancelar</Button>
        <Button variant='contained' type="submit">{exercise ? 'Editar' : 'Criar'} exercício</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExerciseForm;
