import * as React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Template from '../components/Template';
import { Grid2, Paper } from '@mui/material';
import Breadcrumb from '../components/Breadcrumb';
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId } from '@mui/x-data-grid';
import FloatingButton from '../components/FloatingButton';
import DeleteDialog from '../components/DeleteDialog';
import { useGlobalState } from '../GlobalState';
import axios from 'axios';
import { Training } from '../domain/types';
import { handleOpenNotification, SNACKBAR_TYPES } from '../components/MySnackbar';
import TrainingForm from '../components/forms/TrainingForm';
import { paginationModel } from './@shared/pagination'
const URL = `${process.env.REACT_APP_BACKEND_GRAPH_API}/trainings`;
const token = localStorage.getItem('auth-token');

const Trainings: React.FC = () => {
  const { setLoading } = useGlobalState();
  const [trainings, setTrainings] = React.useState<Training[]>([]);
  const [editingTraining, setEditingTraining] = React.useState<Training | undefined>(undefined);
  const [formDialogIsOpen, setOpenFormDialog] = React.useState(false);
  const deleteDialogIsOpen = false;
  const handleCloseDeleteDialog = () => { }
  const handleEditClick = (id: GridRowId) => { }
  const handleDeleteClick = (id: GridRowId) => { }

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrainings(response.data)
    } catch (error) {
      handleOpenNotification("Falha ao listar os treinos", SNACKBAR_TYPES.error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (training: Training) => {
    console.log("🚀 ~ handleSubmit ~ training:", training)
    if (editingTraining && editingTraining.id) {
      return ;
    }

    await axios.post(URL, training, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(() => {
      fetchTrainings();
      handleOpenNotification("Treino cadastrado com sucesso!", SNACKBAR_TYPES.success);
    }).catch(() => {
      handleOpenNotification("Falha ao cadastrar treino", SNACKBAR_TYPES.error);
    })
  }

  const handleCloseModal = () => {
    // clearEditUser()
    setOpenFormDialog(false)
  }

  React.useEffect(() => {
    fetchTrainings();
  }, []);

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', width: 200 },
    { field: 'description', headerName: 'Descrição', width: 300 },
    { field: 'show_to_student', headerName: 'Mostrar', valueFormatter: value => (value ? 'Sim' : 'Não') },
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
    <Template pageName='Treinos' >
      <React.Fragment>
        <Grid2 container spacing={2}>
          <Grid2 size={12}>
            <Breadcrumb uri='trainings' title='Treinos' />
            <Paper sx={{ height: 400, width: '100%' }}>
              <DataGrid
                disableColumnMenu={false}
                rows={trainings}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10, 50]}
                checkboxSelection
                sx={{ border: 0 }}
              />
            </Paper>
          </Grid2>
        </Grid2>

        <FloatingButton onClick={() => setOpenFormDialog(true)} />
        <TrainingForm training={editingTraining} isOpen={formDialogIsOpen} onSubmit={handleSubmit} handleClose={handleCloseModal} />
        <DeleteDialog title='Excluir Treino' handleCloseDeleteDialog={handleCloseDeleteDialog} isOpen={deleteDialogIsOpen} />
      </React.Fragment>
    </Template>
  )
}
export default Trainings;