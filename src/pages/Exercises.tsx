import * as React from 'react';
import { Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId } from '@mui/x-data-grid';
import Template from '../components/Template';
import { Exercise } from '../domain/types';
import axios from 'axios';
import DeleteDialog from '../components/DeleteDialog';
import FloatingButton from '../components/FloatingButton';
import ExerciseForm from '../components/forms/ExerciseForm';
import { handleOpenNotification, SNACKBAR_TYPES } from '../components/MySnackbar';
import Breadcrumb from '../components/Breadcrumb';
import { useGlobalState } from "../GlobalState";
const paginationModel = { page: 0, pageSize: 5 };
const URL = `${process.env.REACT_APP_BACKEND_GRAPH_API}/exercises`;
const token = localStorage.getItem('auth-token');

const Exercises: React.FC = () => {
  const { setLoading } = useGlobalState();
  const [exercises, setExercises] = React.useState<Exercise[]>([]);
  const [deleteDialogIsOpen, setOpenDeleteDialog] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [formDialogIsOpen, setOpenFormDialog] = React.useState(false);
  const [editingExercise, setEditingExercise] = React.useState<Exercise | undefined>(undefined);

  const handleEditClick = (id: GridRowId) => {
    setOpenFormDialog(true)
    const editItem = exercises.find(item => item.id == id.toString())
    if (editItem) {
      setEditingExercise(editItem)
    }
  }

  const handleDeleteClick = (id: GridRowId) => {
    setDeleteId(id.toString())
    setOpenDeleteDialog(true)
  }

  const handleSubmit = async (exercise: Exercise) => {
    if (editingExercise && editingExercise.id) {
      await axios.put(`${URL}/${editingExercise.id}`, {
        name: exercise.name,
        instructions: exercise.instructions,
        video: exercise.video,
        rest: exercise.rest,
        load: exercise.load,
        series: exercise.series,
        load_progress: exercise.load_progress,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(() => {
        fetchExercises();
        handleOpenNotification("Exercício atualizado com sucesso!", SNACKBAR_TYPES.success);
        clearEditUser()
      }).catch(() => {
        fetchExercises();
        handleOpenNotification("Falha ao atualizar exercício!", SNACKBAR_TYPES.error);
        clearEditUser()
      })
      return;
    }

    await axios.post(URL, exercise, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(() => {
      fetchExercises();
      handleOpenNotification("Exercício cadastrado com sucesso!", SNACKBAR_TYPES.success);
    }).catch(() => {
      handleOpenNotification("Falha ao cadastrar exercício", SNACKBAR_TYPES.error);
    })
  }

  const handleCloseModal = () => {
    clearEditUser()
    setOpenFormDialog(false)
  }

  const clearEditUser = () => {
    setEditingExercise({
      id: '',
      name: '',
      instructions: '',
      video: '',
      rest: 30,
      load: 0,
      series: 4,
      load_progress: false
    })
  }

  const handleCloseDeleteDialog = async (confirm: boolean) => {
    if (confirm && deleteId) {
      await axios.delete(`${URL}/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(() => {
        handleOpenNotification("Exercício excluido com sucesso!", SNACKBAR_TYPES.success);
      }).catch(() => {
        handleOpenNotification("Erro ao excluir o exercício!", SNACKBAR_TYPES.error);
      })
    }
    setOpenDeleteDialog(false);
    await fetchExercises()
  };

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await axios.get(URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExercises(response.data)
    } catch (error) {
      handleOpenNotification("Falha ao listar os exercícios", SNACKBAR_TYPES.error);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchExercises();
  }, []);

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', width: 200 },
    { field: 'instructions', headerName: 'Instruções', width: 300 },
    { field: 'series', headerName: 'series' },
    { field: 'rest', headerName: 'Descanço', width: 150 },
    { field: 'load_progress', headerName: 'PC', valueFormatter: value => (value ? '-' : 'Sim') },
    {
      field: 'actions',
      type: 'actions',
      width: 200,
      headerName: 'Editar/Excluir',
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Save"
            sx={{
              color: 'primary.main',
            }}
            onClick={() => handleEditClick(id)}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Cancel"
            className="textPrimary"
            onClick={() => handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Template pageName='Execícios' >
      <React.Fragment>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Breadcrumb uri='exercises' title='Exercícios' />
            <Paper sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={exercises}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10, 50]}
                checkboxSelection
                sx={{ border: 0 }}
              />
            </Paper>
          </Grid>
        </Grid>
        <ExerciseForm exercise={editingExercise} isOpen={formDialogIsOpen} onSubmit={handleSubmit} handleClose={handleCloseModal} />
        <FloatingButton onClick={() => setOpenFormDialog(true)} />
        <DeleteDialog title='Excluir Exercício' handleCloseDeleteDialog={handleCloseDeleteDialog} isOpen={deleteDialogIsOpen} />
      </React.Fragment>
    </Template>
  )
}
export default Exercises;