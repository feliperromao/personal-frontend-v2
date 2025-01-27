import React, { useState, useEffect } from 'react';
import { Training, User } from '../../domain/types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, TextField, Grid, Switch, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, ListItemIcon, Paper } from '@mui/material';
import { handleOpenNotification, SNACKBAR_TYPES } from '../MySnackbar';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import SelectExercises from './SelectExercises';

const STUDENTS_API_URL = `${process.env.REACT_APP_BACKEND_GRAPH_API}/students`
const token = localStorage.getItem('auth-token');

interface TrainingFormProps {
  training?: Training | null;
  isOpen: boolean;
  onSubmit: (training: Training) => void;
  handleClose: () => void;
}

const TrainingForm: React.FC<TrainingFormProps> = ({ training, isOpen, onSubmit, handleClose }) => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [formData, setFormData] = useState<Training>({
    name: '',
    description: '',
    show_to_student: false,
    student_id: '',
    exercises: []
  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get(STUDENTS_API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data)
    } catch (error) {
      handleOpenNotification("Falha ao listar alunos!", SNACKBAR_TYPES.error);
    }
  };

  useEffect(() => {
    fetchUsers()
    if (training) {
      setFormData(training);
    }
  }, [training]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleChangeSelect = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    console.log("🚀 ~ handleChangeSelect ~ name, value:", name, value)
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeStudent = (value: string | number) => {
    console.log("🚀 ~ handleChangeStudent ~ value:", value)
  }

  return (
    <Dialog
      fullWidth={true}
      maxWidth="md"
      open={isOpen}
      onClose={handleClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          onSubmit(formData);
          setFormData({ name: '', description: '', show_to_student: false, student_id: '', exercises: [] });
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
        </Grid>
        <Grid container spacing={3} mt={1}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="student-label-id">Aluno</InputLabel>
              <Select labelId="student-label-id" id="student_id" name="student_id" value={formData.student_id} label="Aluno" onChange={handleChangeSelect}>
                {users.map((item) => (
                  <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                ))}
              </Select>
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
        </Grid>
        <Grid container spacing={3} mt={1}>
          <SelectExercises />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button variant="contained" type="submit">{training ? 'Editar' : 'Salvar'}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default TrainingForm