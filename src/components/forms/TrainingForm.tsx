import React, { useState, useEffect } from 'react';
import { Exercise, Training } from '../../domain/types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Grid,
  Switch,
  FormControl,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Typography,
  Autocomplete,
  Card,
  CardContent,
  useMediaQuery,
  Stack
} from '@mui/material';
import SelectExercises from './SelectExercises';
import { ArrowDownward, ArrowUpward, Delete, Add, Save, Close } from '@mui/icons-material';

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
  const isMobile = useMediaQuery('(max-width:600px)');
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
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
      setSelectedExercises(training.exercises);
      const currentStudent = students.find(item => item.value === training.student_id);
      if (currentStudent) {
        setStudent(currentStudent);
      }
    }
  }, [training]);

  const openExercisesModal = () => setShowExerciseModal(true);
  const closeExercisesModal = () => setShowExerciseModal(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangeCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, show_to_student: e.target.checked }));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...selectedExercises];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setSelectedExercises(newItems);
  };

  const addExercise = (item: Exercise): void => {
    const founded = selectedExercises.find(exercise => exercise.id === item.id)
    if (!founded) {
      setSelectedExercises([...selectedExercises, item]);
    }
  }

  const removeExercise = (id: string) => {
    console.log("🚀 ~ removeExercise ~ id:", id)
    setSelectedExercises(prev => prev.filter(exercise => exercise.id !== id));
  };

  const clearFormData = () => {
    setFormData({ name: '', description: '', show_to_student: false, student_id: '', exercises: [] });
    setSelectedExercises([]);
    setStudent(null);
  }

  const onClose = () => {
    setFormData({ name: '', description: '', show_to_student: false, student_id: '', exercises: [] });
    setSelectedExercises([]);
    setStudent(null);
    handleClose();
  };

  return (
    <Dialog
      fullScreen={isMobile}
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
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>Cadastro de Treinos</DialogTitle>
      <DialogContent sx={{ paddingTop: '20px!important' }}>
        <Card variant="outlined">
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField required label="Nome do Treino" fullWidth variant="outlined" name="name" value={formData.name} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField required label="Descrição das Instruções" fullWidth variant="outlined" name="description" value={formData.description} onChange={handleChange} />
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
              <Grid item xs={12} md={6} sx={{display: "flex"}}>
                <FormControlLabel control={<Switch checked={formData.show_to_student} onChange={handleChangeCheckbox} />} label="Exibir para aluno" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
          <Typography variant="h6">Exercícios</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={openExercisesModal}>Adicionar Exercício</Button>
        </Stack>

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small" sx={{border: "1px solid #ddd"}}>
            <TableHead sx={{backgroundColor: "#ddd"}}>
              <TableRow>
                <TableCell>Ordem</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Instruções</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedExercises.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <IconButton onClick={() => moveItem(index, "up")} disabled={index === 0}><ArrowUpward /></IconButton>
                    <IconButton onClick={() => moveItem(index, "down")} disabled={index === selectedExercises.length - 1}><ArrowDownward /></IconButton>
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.instructions}</TableCell>
                  <TableCell>
                    <IconButton color="error" onClick={() => removeExercise(item.id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button startIcon={<Close />} onClick={onClose}>Cancelar</Button>
        <Button variant="contained" startIcon={<Save />} type="submit">Salvar</Button>
      </DialogActions>
      <SelectExercises
        isOpen={showExerciseModal}
        handleClose={closeExercisesModal}
        addExercise={(item: Exercise) => addExercise(item)}
        removeExercise={() => { }} />
    </Dialog>
  );
};

export default TrainingForm;