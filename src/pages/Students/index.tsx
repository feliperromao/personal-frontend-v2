import { useCallback, useEffect, useState } from 'react';
import { DeleteOutline, EditOutlined, FormatListNumbered, NavigateBefore, NavigateNext, Replay } from '@mui/icons-material';
import { Alert, Box, Button, IconButton, MenuItem, Paper, Skeleton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel, GridRowId } from '@mui/x-data-grid';
import DeleteDialog from '../../components/DeleteDialog';
import FloatingButton from '../../components/FloatingButton';
import SearchInput from '../../components/forms/SearchInput';
import ItemsMenu from '../../components/table/ItemsMenu';
import Template from '../../components/Template';
import { User } from '../../domain/types';
import get_erros_message from '../../erros/get_erros_message';
import { tokens } from '../../theme';
import api from '../@shared/api';
import { paginationModel } from '../@shared/pagination';
import ShowTrainings from './ShowTrainings';
import UserForm from './StudentsForm';
import { handleOpenNotification, SNACKBAR_TYPES } from '../../components/MySnackbar';

const URL = '/students';

export default function Students() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [trainingStudent, setTrainingStudent] = useState<User>();

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await api.get(URL, { params: { page: page + 1, search } });
      setUsers(response.data.data || []);
      setRowCount(response.data.total_documents || 0);
    } catch { setError('Não foi possível carregar os alunos. Verifique a conexão e tente novamente.'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const edit = (id?: GridRowId) => {
    setEditing(users.find((user) => user.id === id?.toString()));
    setFormOpen(true);
  };

  const submit = async (user: User) => {
    const payload = { ...user, weight: Number(user.weight), height: Number(user.height), monthly_value_brl: Number(user.monthly_value_brl), blocked: user.blocked || false };
    try {
      if (editing?.id) await api.put(`${URL}/${editing.id}`, payload);
      else await api.post(URL, payload);
      handleOpenNotification(editing ? 'Aluno atualizado com sucesso.' : 'Aluno cadastrado com sucesso.', SNACKBAR_TYPES.success);
      setFormOpen(false); setEditing(undefined); await fetchUsers();
    } catch (requestError: any) {
      handleOpenNotification(`Não foi possível salvar o aluno. ${get_erros_message(requestError?.response?.data?.message || [])}`, SNACKBAR_TYPES.error);
      throw requestError;
    }
  };

  const confirmDelete = async (confirm: boolean) => {
    if (confirm && deleteId) {
      try { await api.delete(`${URL}/${deleteId}`); await fetchUsers(); }
      catch { handleOpenNotification('Não foi possível excluir o aluno.', SNACKBAR_TYPES.error); }
    }
    setDeleteId(null);
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 220 },
    { field: 'email', headerName: 'E-mail', flex: 1, minWidth: 220 },
    { field: 'monthly_value_brl', headerName: 'Mensalidade', width: 150, valueFormatter: (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}` },
    { field: 'actions', type: 'actions', headerName: 'Ações', width: 90, getActions: ({ id }) => [
      <ItemsMenu key={id} rowId={id} handleDelete={() => setDeleteId(id.toString())} handleEdit={() => edit(id)}>
        <MenuItem onClick={() => setTrainingStudent(users.find((user) => user.id === id.toString()))}><FormatListNumbered sx={{ mr: 1 }} />Ver treinos</MenuItem>
      </ItemsMenu>,
    ] },
  ];

  return (
    <Template pageName="Alunos">
      <Stack spacing={3}>
        <Box>
          <Typography component="h2" variant="h2">Alunos</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Gerencie acessos e fichas sem perder o contexto de cada aluno.</Typography>
        </Box>
        <SearchInput handleChange={setSearch} handleSearch={() => { setPage(0); fetchUsers(); }} />
        {error && <Alert severity="error" action={<Button color="inherit" startIcon={<Replay />} onClick={fetchUsers}>Tentar novamente</Button>}>{error}</Alert>}

        {mobile ? (
          <Stack spacing={1.5}>
            {loading ? [1, 2, 3].map((item) => <Skeleton key={item} variant="rounded" height={154} />) : users.map((user) => (
              <Paper key={user.id} sx={{ p: 2.25, border: `1px solid ${tokens.color.line}` }}>
                <Typography component="h3" variant="h5">{user.name}</Typography>
                <Typography color="text.secondary">{user.email}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>Mensalidade: R$ {Number(user.monthly_value_brl || 0).toFixed(2).replace('.', ',')}</Typography>
                <Stack direction="row" justifyContent="flex-end" spacing={0.5} sx={{ mt: 1.5 }}>
                  <IconButton aria-label={`Ver treinos de ${user.name}`} onClick={() => setTrainingStudent(user)}><FormatListNumbered /></IconButton>
                  <IconButton aria-label={`Editar ${user.name}`} onClick={() => edit(user.id)}><EditOutlined /></IconButton>
                  <IconButton aria-label={`Excluir ${user.name}`} color="error" onClick={() => setDeleteId(user.id || null)}><DeleteOutline /></IconButton>
                </Stack>
              </Paper>
            ))}
            {!loading && users.length === 0 && !error && <Paper sx={{ p: 3, border: `1px solid ${tokens.color.line}` }}><Typography variant="h5">Nenhum aluno encontrado</Typography><Typography color="text.secondary">Ajuste a busca ou cadastre o primeiro aluno.</Typography></Paper>}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Button startIcon={<NavigateBefore />} disabled={page === 0 || loading} onClick={() => setPage((value) => Math.max(0, value - 1))}>Anterior</Button>
              <Typography variant="body2">Página {page + 1}</Typography>
              <Button endIcon={<NavigateNext />} disabled={(page + 1) * 10 >= rowCount || loading} onClick={() => setPage((value) => value + 1)}>Próxima</Button>
            </Stack>
          </Stack>
        ) : (
          <Paper sx={{ height: 620, border: `1px solid ${tokens.color.line}` }}>
            <DataGrid rows={users} columns={columns} loading={loading} initialState={{ pagination: { paginationModel } }} paginationMode="server" rowCount={rowCount} onPaginationModelChange={(model: GridPaginationModel) => setPage(model.page)} disableRowSelectionOnClick />
          </Paper>
        )}
      </Stack>

      <ShowTrainings handleClose={() => setTrainingStudent(undefined)} open={Boolean(trainingStudent)} student={trainingStudent} />
      <UserForm user={editing} isOpen={formOpen} onSubmit={submit} handleClose={() => { setFormOpen(false); setEditing(undefined); }} />
      <DeleteDialog title="Excluir aluno" handleCloseDeleteDialog={confirmDelete} isOpen={Boolean(deleteId)} />
      <FloatingButton onClick={() => { setEditing(undefined); setFormOpen(true); }} />
    </Template>
  );
}
