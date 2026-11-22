import { useCallback, useEffect, useState } from 'react';
import { Add, DeleteOutline, EditOutlined, Replay } from '@mui/icons-material';
import { Alert, Box, Button, Chip, IconButton, Paper, Skeleton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import DeleteDialog from '../../../components/DeleteDialog';
import { handleOpenNotification, SNACKBAR_TYPES } from '../../../components/MySnackbar';
import Template from '../../../components/Template';
import ItemsMenu from '../../../components/table/ItemsMenu';
import { PersonalAccount, PersonalAccountInput } from '../../../domain/types';
import get_erros_message from '../../../erros/get_erros_message';
import { tokens } from '../../../theme';
import api from '../../@shared/api';
import PersonalForm from './PersonalForm';

const URL = '/personals';

export default function AdminPersonals() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [personals, setPersonals] = useState<PersonalAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PersonalAccount>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchPersonals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get<PersonalAccount[]>(URL);
      setPersonals(data);
    } catch {
      setError('Não foi possível carregar os personals. Verifique a conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPersonals(); }, [fetchPersonals]);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (personal: PersonalAccount) => {
    setEditing(personal);
    setFormOpen(true);
  };

  const submit = async (values: PersonalAccountInput) => {
    const { confirm_password: _confirmation, ...payload } = values;
    if (!payload.password) delete (payload as { password?: string }).password;
    try {
      if (editing) await api.put(`${URL}/${editing.id}`, payload);
      else await api.post(URL, payload);
      handleOpenNotification(editing ? 'Personal atualizado com sucesso.' : 'Personal cadastrado com sucesso.', SNACKBAR_TYPES.success);
      setFormOpen(false);
      setEditing(undefined);
      await fetchPersonals();
    } catch (requestError: any) {
      const details = get_erros_message(requestError?.response?.data?.message || 'Tente novamente.');
      handleOpenNotification(`Não foi possível salvar o personal. ${details}`, SNACKBAR_TYPES.error);
      throw requestError;
    }
  };

  const confirmDelete = async (confirmed: boolean) => {
    if (confirmed && deleteId) {
      try {
        await api.delete(`${URL}/${deleteId}`);
        handleOpenNotification('Personal excluído com sucesso.', SNACKBAR_TYPES.success);
        await fetchPersonals();
      } catch {
        handleOpenNotification('Não foi possível excluir o personal.', SNACKBAR_TYPES.error);
      }
    }
    setDeleteId(null);
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 200 },
    { field: 'email', headerName: 'E-mail', flex: 1, minWidth: 220 },
    { field: 'phone', headerName: 'Celular', width: 160, valueGetter: (value) => value || '—' },
    {
      field: 'blocked', headerName: 'Acesso', width: 120, renderCell: ({ value }) => (
        <Chip size="small" color={value ? 'default' : 'success'} label={value ? 'Bloqueado' : 'Ativo'} />
      ),
    },
    {
      field: 'actions', type: 'actions', headerName: 'Ações', width: 90, getActions: ({ id }) => {
        const personal = personals.find((item) => item.id === id);
        return personal ? [
          <ItemsMenu key={id} rowId={id} handleEdit={() => openEdit(personal)} handleDelete={() => setDeleteId(personal.id)} />,
        ] : [];
      },
    },
  ];

  return (
    <Template pageName="Administração" type="ADMIN">
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'end' }} justifyContent="space-between" gap={2}>
          <Box>
            <Typography component="h2" variant="h2">Personals</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: '68ch' }}>
              Controle quem pode acessar a plataforma. Os planos serão associados aos personals em uma próxima etapa.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Cadastrar personal</Button>
        </Stack>

        {error && <Alert severity="error" action={<Button color="inherit" startIcon={<Replay />} onClick={fetchPersonals}>Tentar novamente</Button>}>{error}</Alert>}

        {mobile ? (
          <Stack spacing={1.5}>
            {loading && [1, 2, 3].map((item) => <Skeleton key={item} variant="rounded" height={156} />)}
            {!loading && personals.map((personal) => (
              <Paper key={personal.id} sx={{ p: 2.25, border: `1px solid ${tokens.color.line}` }}>
                <Stack direction="row" alignItems="start" justifyContent="space-between" gap={1}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography component="h3" variant="h5">{personal.name}</Typography>
                    <Typography color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{personal.email}</Typography>
                  </Box>
                  <Chip size="small" color={personal.blocked ? 'default' : 'success'} label={personal.blocked ? 'Bloqueado' : 'Ativo'} />
                </Stack>
                <Typography variant="body2" sx={{ mt: 1.5 }}>{personal.phone || 'Celular não informado'}</Typography>
                <Stack direction="row" justifyContent="flex-end" spacing={0.5} sx={{ mt: 1 }}>
                  <IconButton aria-label={`Editar ${personal.name}`} onClick={() => openEdit(personal)}><EditOutlined /></IconButton>
                  <IconButton aria-label={`Excluir ${personal.name}`} color="error" onClick={() => setDeleteId(personal.id)}><DeleteOutline /></IconButton>
                </Stack>
              </Paper>
            ))}
            {!loading && personals.length === 0 && !error && (
              <Paper sx={{ p: 3, border: `1px solid ${tokens.color.line}` }}>
                <Typography variant="h5">Nenhum personal cadastrado</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>Cadastre o primeiro personal para liberar o acesso à plataforma.</Typography>
                <Button startIcon={<Add />} onClick={openCreate} sx={{ mt: 2 }}>Cadastrar personal</Button>
              </Paper>
            )}
          </Stack>
        ) : (
          <Paper sx={{ height: 620, border: `1px solid ${tokens.color.line}` }}>
            <DataGrid rows={personals} columns={columns} loading={loading} disableRowSelectionOnClick hideFooterSelectedRowCount />
          </Paper>
        )}
      </Stack>

      <PersonalForm personal={editing} open={formOpen} onClose={() => { setFormOpen(false); setEditing(undefined); }} onSubmit={submit} />
      <DeleteDialog title="Excluir personal" isOpen={Boolean(deleteId)} handleCloseDeleteDialog={confirmDelete} />
    </Template>
  );
}
