import React, { useState, useEffect } from 'react';
import { Exercise, Training, User } from '../../domain/types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, TextField, Grid, Switch, FormControl, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Typography, Autocomplete } from '@mui/material';
import SelectExercises from './SelectExercises';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';

export interface Option {
  label: string;
  value: string;
}

interface TrainingFormProps {
  training?: Training | null;
  isOpen: boolean;
  students: Option[];
  onSubmit: (training: Training) => void;
  handleClose: () => void;
}

const TrainingForm: React.FC<TrainingFormProps> = ({ training, isOpen, students, onSubmit, handleClose }) => {
  const [showExerciseModal, setShowExerciseModal] = React.useState(false);
  const [selectedExercises, setSelectedExercises] = React.useState<Exercise[]>([]);
  const [student, setStudent] = useState<Option | null>(null);
  const [formData, setFormData] = useState<Training>({
    name: '',
    description: '',
    show_to_student: false,
    student_id: '',
    exercises: []
  });

  useEffect(() => {
    if (training) {
      setFormData(training);
      setSelectedExercises(training.exercises)
      const currentSdudent = students.find(item => item.value === training.student_id);
      if (currentSdudent) {
        setStudent(currentSdudent);
      }
    }
  }, [training, selectedExercises]);

  const openExercisesModal = (): any => {
    setShowExerciseModal(true)
  }

  const closeExercisesModal = (): any => {
    setShowExerciseModal(false)
  }

  const addExercise = (item: Exercise): void => {
    const founded = selectedExercises.find(exercise => exercise.id === item.id)
    if (!founded) {
      setSelectedExercises([...selectedExercises, item]);
    }
  }

  const removeExercise = (item: Exercise): any => {
    const founded = selectedExercises.filter(exercise => exercise.id !== exercise.id)
    setSelectedExercises(founded);
  }

  const updateExercises = (items: Exercise[]): any => {
    setSelectedExercises(items);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...selectedExercises];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    updateExercises(newItems);
  };

  const clearFormData = () => {
    setFormData({ name: '', description: '', show_to_student: false, student_id: '', exercises: [] });
    setSelectedExercises([]);
    setStudent(null);
  }

  const onClose = () => {
    clearFormData();
    handleClose();
  }

  return (
    <React.Fragment>
      <Dialog
        fullWidth={true}
        maxWidth="md"
        open={isOpen}
        onClose={onClose}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            onSubmit({
              ...formData,
              exercises: selectedExercises,
            });
            clearFormData();
            handleClose();
          },
        }}
      >
        <DialogTitle>Cadastro de Treinos</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField required id="name" name="name" label="Nome" fullWidth variant="outlined" value={formData.name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField required id="description" name="description" label="Instruções" fullWidth variant="outlined" value={formData.description} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Autocomplete
                  options={students}
                  getOptionLabel={(option) => option.label}
                  value={student}
                  onChange={(_, newValue) => {
                    setStudent(newValue)
                    setFormData(prev => ({ ...prev, student_id: newValue?.value || '' }));
                  }}
                  renderInput={(params) => <TextField {...params} label="Aluno" variant="outlined" />}
                  fullWidth
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                sx={{ mt: 1 }}
                control={
                  <Switch
                    id="show_to_student" name="show_to_student" checked={formData.show_to_student} onChange={handleChangeCheckbox} />
                }
                label="Exibir para aluno"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Button color="inherit" variant="contained" onClick={openExercisesModal}>
                Selecionar Exercicios
              </Button>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={12} md={12}>
              <SelectExercises
                isOpen={showExerciseModal}
                handleClose={closeExercisesModal}
                addExercise={(item: Exercise) => addExercise(item)}
                removeExercise={(item: Exercise) => removeExercise(item)}
              />
            </Grid>
            <Grid item xs={12} md={12} mt={2}>
              <Paper elevation={3}>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: '600' }}>Ordenar</TableCell>
                        <TableCell sx={{ fontWeight: '600' }}>Posição</TableCell>
                        <TableCell sx={{ fontWeight: '600' }}>Nome</TableCell>
                        <TableCell sx={{ fontWeight: '600' }}>Instruções</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedExercises.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align='center'>
                            <Typography sx={{ color: 'grey' }} variant="h6" component="h6">
                              Nenhum exercicio selecionado
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : selectedExercises.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <IconButton onClick={() => moveItem(index, "up")} disabled={index === 0}>
                              <ArrowUpward />
                            </IconButton>
                            <IconButton onClick={() => moveItem(index, "down")} disabled={index === selectedExercises.length - 1}>
                              <ArrowDownward />
                            </IconButton>
                          </TableCell>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.instructions}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>

        </DialogContent>
        <DialogActions>
          <Button color='inherit' onClick={onClose}>Cancelar</Button>
          <Button variant="contained" type="submit">{training ? 'Editar' : 'Salvar'}</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default TrainingForm