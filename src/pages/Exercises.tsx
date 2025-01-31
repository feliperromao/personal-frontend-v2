import * as React from 'react';
import { Box, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { DataGrid, GridColDef, GridPaginationModel, GridRowId, GridRowSelectionModel } from '@mui/x-data-grid';
import Template from '../components/Template';
import { Exercise } from '../domain/types';
import axios from 'axios';
import DeleteDialog from '../components/DeleteDialog';
import FloatingButton from '../components/FloatingButton';
import ExerciseForm from '../components/forms/ExerciseForm';
import { handleOpenNotification, SNACKBAR_TYPES } from '../components/MySnackbar';
import Breadcrumb from '../components/Breadcrumb';
import { useGlobalState } from "../GlobalState";
import ItemsMenu from '../components/table/ItemsMenu';
import SearchInput from '../components/SearchInput';
const paginationModel = { page: 0, pageSize: 10 };
const URL = `${process.env.REACT_APP_BACKEND_GRAPH_API}/exercises`;
const token = localStorage.getItem('auth-token');

const Exercises: React.FC = () => {
  const { setLoading } = useGlobalState();
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [exercises, setExercises] = React.useState<Exercise[]>([]);
  const [deleteDialogIsOpen, setOpenDeleteDialog] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [formDialogIsOpen, setOpenFormDialog] = React.useState(false);
  const [editingExercise, setEditingExercise] = React.useState<Exercise | undefined>(undefined);
  const [currentPage, setCurrentPage] = React.useState<number>(0);
  const [rowCount, setRowCount] = React.useState<number>(0);
  const [selected, setSelected] = React.useState<GridRowSelectionModel>([]);

  React.useEffect(() => {
    fetchExercises();
  }, [currentPage]);

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

  const onPaginationModelChange = (data: GridPaginationModel) => {
    const { page } = data;
    setCurrentPage(page);
    fetchExercises();
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
        handleCloseModal();
        handleOpenNotification("Exercício atualizado com sucesso!", SNACKBAR_TYPES.success);
      }).catch(() => {
        handleOpenNotification("Falha ao atualizar exercício!", SNACKBAR_TYPES.error);
      })
      return;
    }

    await axios.post(URL, exercise, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(() => {
      fetchExercises();
      handleCloseModal();
      handleOpenNotification("Exercício cadastrado com sucesso!", SNACKBAR_TYPES.success);
    }).catch(() => {
      handleOpenNotification("Falha ao cadastrar exercício", SNACKBAR_TYPES.error);
    })
  }

  const handleCloseModal = () => {
    setEditingExercise(undefined)
    setOpenFormDialog(false)
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
    const page = currentPage + 1
    try {
      setLoading(true);
      const response = await axios.get(`${URL}?page=${page}&search=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExercises(response.data.data);
      setRowCount(response.data.total_documents);
    } catch (error) {
      handleOpenNotification("Falha ao listar os exercícios", SNACKBAR_TYPES.error);
    } finally {
      setLoading(false);
    }
  }

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', width: 200 },
    { field: 'instructions', headerName: 'Instruções', width: 300 },
    { field: 'series', headerName: 'series' },
    { field: 'rest', headerName: 'Descanço', width: 150 },
    { field: 'load_progress', headerName: 'PC', valueFormatter: value => (value ? '-' : 'Sim') },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Opções',
      width: 100,
      getActions: ({ id }) => {
        return [
          <ItemsMenu rowId={id} handleDelete={handleDeleteClick} handleEdit={() => handleEditClick(id)} />
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

            <Box display="flex" alignItems="center" gap={1} sx={{ margin: '16px 0' }}>
              <SearchInput search={searchQuery} handleChange={setSearchQuery} handleSearch={fetchExercises} />
            </Box>

            <Paper sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={exercises}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                onPaginationModelChange={onPaginationModelChange}
                onRowSelectionModelChange={setSelected}
                checkboxSelection
                paginationMode="server"
                sx={{ border: 0 }}
                rowCount={rowCount}
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