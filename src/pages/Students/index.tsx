import * as React from 'react';
import { Box, Grid, MenuItem, Paper, Typography, IconButton, Tooltip } from "@mui/material";
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TableRowsIcon from '@mui/icons-material/TableRows';
import GridViewIcon from '@mui/icons-material/GridView';
import { DataGrid, GridColDef, GridPaginationModel, GridRowId, GridRowSelectionModel } from '@mui/x-data-grid';
import DeleteDialog from '../../components/DeleteDialog';
import FloatingButton from '../../components/FloatingButton';
import Template from '../../components/Template';
import { User } from '../../domain/types';
import UserForm from './StudentsForm';
import Breadcrumb from '../../components/nav/Breadcrumb';
import { handleOpenNotification, SNACKBAR_TYPES } from '../../components/MySnackbar';
import { useGlobalState } from "../../GlobalState";
import get_erros_message from '../../erros/get_erros_message';
import SearchInput from '../../components/forms/SearchInput';
import ItemsMenu from '../../components/table/ItemsMenu';
import { paginationModel } from '../@shared/pagination'
import api from '../@shared/api';
import ShowTrainings from './ShowTrainings';
const URL = '/students'

const Students: React.FC = () => {
  const [formDialogIsOpen, setOpenFormDialog] = React.useState(false);
  const [deleteDialogIsOpen, setOpenDeleteDialog] = React.useState(false);
  const [deleteUserId, setDeleteUserId] = React.useState<string | null>(null);
  const [editingUser, setEditingUser] = React.useState<User | undefined>(undefined);
  const [users, setUsers] = React.useState<User[]>([]);
  const { setLoading } = useGlobalState();
  const [selected, setSelected] = React.useState<GridRowSelectionModel>([])
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [rowCount, setRowCount] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(0);
  const [showModalTrainings, setShowModalTrainings] = React.useState(false)
  const [studentShowTraining, setStudentShowTraining] = React.useState<User | undefined>(undefined);
  const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('table');

  React.useEffect(() => {
    const view = localStorage.getItem('viewMode')
    if (view) {
      setViewMode(view as 'table' | 'cards')
    }
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    const page = currentPage + 1
    try {
      setLoading(true);
      const response = await api.get(`${URL}?page=${page}&search=${searchQuery}`);
      setUsers(response.data.data);
      setRowCount(response.data.total_documents)
    } catch (error) {
      handleOpenNotification("Falha ao listar alunos!", SNACKBAR_TYPES.error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (id?: GridRowId) => {
    const editUser = users.find(user => user.id == id?.toString())
    if (editUser) {
      const { id, name, email, password, birthdate, blocked, height, monthly_value_brl, phone, weight } = editUser
      setEditingUser({ id, name, email, password, birthdate, blocked, height, monthly_value_brl, phone, weight } as User)
      setOpenFormDialog(true)
    }
  }

  const onPaginationModelChange = (data: GridPaginationModel) => {
    const { page } = data;
    setCurrentPage(page);
    fetchUsers();
  }

  const closeModal = (): void => {
    setOpenFormDialog(false)
    setEditingUser(undefined);
  };

  const handleSubmit = async (user: User) => {
    const userData = {
      name: user.name,
      email: user.email,
      password: user.password,
      confirm_password: user.confirm_password,
      phone: user.phone,
      birthdate: user.birthdate,
      weight: Number(user.weight),
      height: Number(user.height),
      monthly_value_brl: Number(user.monthly_value_brl),
      blocked: user.blocked || false,
    }
    if (editingUser && editingUser.id) {
      delete user.id
      await api.put(`${URL}/${editingUser.id}`, userData).then(() => {
        handleOpenNotification("Aluno editado com sucesso!", SNACKBAR_TYPES.success);
        fetchUsers();
        closeModal();
      }).catch(error => {
        const error_messages = get_erros_message(error?.response?.data?.message || [])
        handleOpenNotification("Falha ao editar aluno!" + error_messages, SNACKBAR_TYPES.error);
      })
    } else {
      await api.post(URL, userData).then(() => {
        handleOpenNotification("Aluno cadastrado com sucesso!", SNACKBAR_TYPES.success);
        fetchUsers();
        closeModal();
      }).catch(error => {
        const error_messages = get_erros_message(error?.response?.data?.message || [])
        handleOpenNotification("Falha ao cadastrar novo aluno: " + error_messages, SNACKBAR_TYPES.error);
      })
    }
  };

  const handleDeleteUserClick = (id?: GridRowId) => {
    if (id) {
      setDeleteUserId(id?.toString())
    }
    setOpenDeleteDialog(true)
  }

  const handleShowTrainings = (id?: GridRowId) => {
    const student = users.find(student => student.id == id)
    if (student) {
      setStudentShowTraining(student)
      setShowModalTrainings(true)
    }
  }

  const handleCloseTrainings = () => {
    setShowModalTrainings(false)
  }

  const handleCloseDeleteDialog = async (confirm: boolean) => {
    if (confirm && deleteUserId) {
      api.delete(`${URL}/${deleteUserId}`)
    }
    setOpenDeleteDialog(false);
    fetchUsers()
  };

  const StudentsCardView = () => {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2, p: 2, height: 600, overflow: 'auto' }}>
        {users.map((user) => (
          <Paper key={user.id} sx={{ padding: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" noWrap>{user.name}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>{user.email}</Typography>
              <Typography variant="body2">Mensalidade: R$ {user.monthly_value_brl ?? 0}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto', gap: 1 }}>
              <IconButton size="small" onClick={() => handleShowTrainings(user?.id)}>
                <FormatListNumberedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleEditClick(user?.id)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDeleteUserClick(user?.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Box>
    );
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', width: 280 },
    { field: 'email', headerName: 'E-mail', width: 250 },
    { field: 'monthly_value_brl', headerName: 'Mensalidade', width: 150 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Opções',
      width: 100,
      getActions: ({ id }) => {
        return [
          <ItemsMenu
            children={
              <MenuItem onClick={() => handleShowTrainings(id)} disableRipple>
                <FormatListNumberedIcon />
                Ver treinos
              </MenuItem>}
            rowId={id}
            handleDelete={handleDeleteUserClick}
            handleEdit={() => handleEditClick(id)}
          />
        ];
      },
    },
  ];

  return (
    <Template pageName='Alunos' >
      <React.Fragment>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Breadcrumb uri='students' title='Alunos' />

            <Box display="flex" alignItems="center" gap={1} sx={{ margin: '16px 0' }}>
              <SearchInput handleChange={setSearchQuery} handleSearch={fetchUsers} />
              <Box display="flex" alignItems="center">
                <Tooltip title="Visualização em tabela">
                  <IconButton 
                    color={viewMode === 'table' ? 'primary' : 'default'} 
                    onClick={() => {
                      setViewMode('table')
                      localStorage.setItem('viewMode', 'table')
                    }}
                  >
                    <TableRowsIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Visualização em cards">
                  <IconButton 
                    color={viewMode === 'cards' ? 'primary' : 'default'} 
                    onClick={() => {
                      setViewMode('cards')
                      localStorage.setItem('viewMode', 'cards')
                    }}
                  >
                    <GridViewIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Paper sx={{ height: 600, width: '100%' }}>
              {viewMode === 'table' ? (
                <DataGrid
                  rows={users}
                  columns={columns}
                  initialState={{ pagination: { paginationModel } }}
                  onRowSelectionModelChange={setSelected}
                  checkboxSelection
                  disableColumnSelector
                  sx={{ border: 0 }}
                  onPaginationModelChange={onPaginationModelChange}
                  paginationMode="server"
                  rowCount={rowCount}
                />
              ) : (
                <StudentsCardView />
              )}
            </Paper>
          </Grid>
        </Grid>
        <ShowTrainings handleClose={handleCloseTrainings} open={showModalTrainings} student={studentShowTraining} />
        <UserForm user={editingUser} isOpen={formDialogIsOpen} onSubmit={handleSubmit} handleClose={() => setOpenFormDialog(false)} />
        <DeleteDialog title="Excluir Usuario" handleCloseDeleteDialog={handleCloseDeleteDialog} isOpen={deleteDialogIsOpen} />
        <FloatingButton onClick={() => {
          setEditingUser(undefined);
          setOpenFormDialog(true)
        }} />
      </React.Fragment>
    </Template>
  );
}

export default Students;