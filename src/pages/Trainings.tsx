import * as React from 'react';
import Template from '../components/Template';
import { Autocomplete, Box, FormControl, Grid2, Paper, TextField } from '@mui/material';
import Breadcrumb from '../components/Breadcrumb';
import { DataGrid, GridColDef, GridPaginationModel, GridRowId } from '@mui/x-data-grid';
import FloatingButton from '../components/FloatingButton';
import DeleteDialog from '../components/DeleteDialog';
import { useGlobalState } from '../GlobalState';
import { Training, User } from '../domain/types';
import { handleOpenNotification, SNACKBAR_TYPES } from '../components/MySnackbar';
import TrainingForm, { Option } from '../components/forms/TrainingForm';
import { paginationModel } from './@shared/pagination';
import api from './@shared/api';
import ItemsMenu from '../components/table/ItemsMenu';
import SearchInput from '../components/SearchInput';

const URL_TRAININGS = `/trainings`;
const URL_STUDENTS = `/students/list-all`;

const Trainings: React.FC = () => {
  const { setLoading } = useGlobalState();
  const [student, setStudent] = React.useState<Option | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [currentPage, setCurrentPage] = React.useState<number>(0);
  const [rowCount, setRowCount] = React.useState<number>(0);
  const [trainings, setTrainings] = React.useState<Training[]>([]);
  const [editingTraining, setEditingTraining] = React.useState<Training | undefined>(undefined);
  const [formDialogIsOpen, setOpenFormDialog] = React.useState(false);
  const [students, setStudents] = React.useState<Option[]>([]);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleteDialogIsOpen, setOpenDeleteDialog] = React.useState(false);

  const handleCloseDeleteDialog = async (confirm: boolean) => {
    if (confirm && deleteId) {
      await api.delete(`${URL_TRAININGS}/${deleteId}`).then(() => {
        handleOpenNotification("Exercício excluido com sucesso!", SNACKBAR_TYPES.success);
      }).catch(() => {
        handleOpenNotification("Erro ao excluir o exercício!", SNACKBAR_TYPES.error);
      })
    }
    setOpenDeleteDialog(false);
    await fetchTrainings()
  };

  const handleEditClick = (id: GridRowId) => {
    const trainingToEdit = trainings.find(training => training.id === id);
    if (trainingToEdit) {
      setEditingTraining(trainingToEdit);
      setOpenFormDialog(true);
    }
  };

  const handleDeleteClick = (id: GridRowId) => {
    setDeleteId(id.toString())
    setOpenDeleteDialog(true)
  }

  const fetchTrainings = async () => {
    const page = currentPage + 1
    try {
      const student_id = student?.value ?? ''
      setLoading(true);
      const response = await api.get(`${URL_TRAININGS}?page=${page}&search=${searchQuery}&student_id=${student_id}`);
      setTrainings(response.data.data);
      setRowCount(response.data.data.length);
    } catch (error) {
      handleOpenNotification("Falha ao listar os treinos", SNACKBAR_TYPES.error);
    } finally {
      setLoading(false);
    }
  };

  const onPaginationModelChange = (data: GridPaginationModel) => {
    const { page } = data;
    setCurrentPage(page);
    fetchTrainings();
  }

  const fetchStudents = async () => {
    try {
      const response = await api.get(URL_STUDENTS);
      const usersRaw = response.data.map((user: User) => ({ label: user.name, value: user.id }));
      setStudents(usersRaw);
    } catch (error) {
      handleOpenNotification("Falha ao carregar alunos", SNACKBAR_TYPES.error);
    }
  };

  const handleSubmit = async (training: Training) => {
    try {
      if (editingTraining) {
        await api.put(`${URL_TRAININGS}/${editingTraining.id}`, {
          name: training.name,
          description: training.description,
          show_to_student: training.show_to_student,
          student_id: training.student_id,
          exercises: training.exercises,
        });
        handleOpenNotification("Treino atualizado com sucesso!", SNACKBAR_TYPES.success);
      } else {
        await api.post(URL_TRAININGS, training);
        handleOpenNotification("Treino cadastrado com sucesso!", SNACKBAR_TYPES.success);
      }
      fetchTrainings();
    } catch (error) {
      handleOpenNotification("Falha ao salvar treino", SNACKBAR_TYPES.error);
    } finally {
      setEditingTraining(undefined);
      setOpenFormDialog(false);
    }
  };

  const handleCloseModal = () => {
    setEditingTraining(undefined);
    setOpenFormDialog(false);
  };

  const getStudentName = (id: string): string | undefined => {
    return students.find(item => item.value === id)?.label;
  };

  React.useEffect(() => {
    fetchStudents();
    fetchTrainings();
  }, [student]);

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', width: 200 },
    { field: 'description', headerName: 'Descrição', width: 300 },
    {
      field: 'student_id', headerName: 'Aluno', width: 200, valueGetter: (params) => getStudentName(params),
    },
    { field: 'show_to_student', headerName: 'Mostrar', valueFormatter: value => (value ? 'Sim' : 'Não') },
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
    <Template pageName='Treinos'>
      <React.Fragment>
        <Breadcrumb uri='trainings' title='Treinos' />

        <Grid2 container columns={2} spacing={2}>
          <Grid2 size={1} >
            <Box display="flex" alignItems="center" gap={1} sx={{ margin: '16px 0' }}>
              <SearchInput
                handleChange={setSearchQuery}
                handleSearch={fetchTrainings}
              />
            </Box>
          </Grid2>
          <Grid2 size={1}>
            <Box display="flex" alignItems="center" gap={1} sx={{ margin: '16px 0' }}>
              <Paper
                sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 600 }}
              >
                <Autocomplete
                  fullWidth
                  options={students}
                  getOptionLabel={(option) => option.label}
                  value={student}
                  onChange={(_, newValue) => {
                    setStudent(newValue)
                    fetchTrainings()
                  }}
                  renderInput={(params) => < TextField label="Aluno" {...params} size="small" sx={{ height: 43 }} />}
                />
              </Paper>
            </Box>
          </Grid2>
        </Grid2>
        <Grid2 container spacing={2}>
          <Grid2 size={12}>
            <Paper sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={trainings}
                columns={columns}
                rowCount={rowCount}
                initialState={{ pagination: { paginationModel } }}
                checkboxSelection
                sx={{ border: 0 }}
                onPaginationModelChange={onPaginationModelChange}
                paginationMode="server"
              />
            </Paper>
          </Grid2>
        </Grid2>

        <FloatingButton onClick={() => setOpenFormDialog(true)} />
        <TrainingForm
          training={editingTraining}
          isOpen={formDialogIsOpen}
          onSubmit={handleSubmit}
          handleClose={handleCloseModal}
          students={students}
        />
        <DeleteDialog title='Excluir Treino' handleCloseDeleteDialog={handleCloseDeleteDialog} isOpen={deleteDialogIsOpen} />
      </React.Fragment>
    </Template>
  );
};

export default Trainings;