import { useCallback, useEffect, useState } from 'react';
import { Add, DeleteOutline, EditOutlined, Replay } from '@mui/icons-material';
import { Alert, Box, Button, IconButton, Paper, Skeleton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import DeleteDialog from '../../../components/DeleteDialog';
import { handleOpenNotification, SNACKBAR_TYPES } from '../../../components/MySnackbar';
import Template from '../../../components/Template';
import ItemsMenu from '../../../components/table/ItemsMenu';
import { SubscriptionPlan, SubscriptionPlanInput } from '../../../domain/types';
import get_erros_message from '../../../erros/get_erros_message';
import { tokens } from '../../../theme';
import api from '../../@shared/api';
import SubscriptionForm from './SubscriptionForm';

const URL = '/subscriptions';
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function AdminSubscriptions() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SubscriptionPlan>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get<SubscriptionPlan[]>(URL);
      setPlans(data);
    } catch {
      setError('Não foi possível carregar os planos. Verifique a conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setEditing(plan);
    setFormOpen(true);
  };

  const submit = async (values: SubscriptionPlanInput) => {
    try {
      if (editing) await api.put(`${URL}/${editing.id}`, values);
      else await api.post(URL, values);
      handleOpenNotification(editing ? 'Plano atualizado com sucesso.' : 'Plano criado com sucesso.', SNACKBAR_TYPES.success);
      setFormOpen(false);
      setEditing(undefined);
      await fetchPlans();
    } catch (requestError: any) {
      const details = get_erros_message(requestError?.response?.data?.message || 'Tente novamente.');
      handleOpenNotification(`Não foi possível salvar o plano. ${details}`, SNACKBAR_TYPES.error);
      throw requestError;
    }
  };

  const confirmDelete = async (confirmed: boolean) => {
    if (confirmed && deleteId) {
      try {
        await api.delete(`${URL}/${deleteId}`);
        handleOpenNotification('Plano excluído com sucesso.', SNACKBAR_TYPES.success);
        await fetchPlans();
      } catch (requestError: any) {
        const details = get_erros_message(requestError?.response?.data?.message || 'Tente novamente.');
        handleOpenNotification(`Não foi possível excluir o plano. ${details}`, SNACKBAR_TYPES.error);
      }
    }
    setDeleteId(null);
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Plano', flex: 1, minWidth: 190 },
    { field: 'max_students', headerName: 'Alunos', width: 110, type: 'number' },
    { field: 'max_exercises', headerName: 'Exercícios', width: 120, type: 'number' },
    { field: 'max_training', headerName: 'Treinos', width: 110, type: 'number' },
    { field: 'price_brl', headerName: 'Preço mensal', width: 150, type: 'number', valueFormatter: (value) => currency.format(Number(value || 0)) },
    {
      field: 'actions', type: 'actions', headerName: 'Ações', width: 90, getActions: ({ id }) => {
        const plan = plans.find((item) => item.id === id);
        return plan ? [
          <ItemsMenu key={id} rowId={id} handleEdit={() => openEdit(plan)} handleDelete={() => setDeleteId(plan.id)} />,
        ] : [];
      },
    },
  ];

  return (
    <Template pageName="Administração" type="ADMIN">
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'end' }} justifyContent="space-between" gap={2}>
          <Box>
            <Typography component="h2" variant="h2">Planos de assinatura</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: '68ch' }}>
              Defina os limites e o preço mensal dos planos associados aos personals.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Criar plano</Button>
        </Stack>

        {error && <Alert severity="error" action={<Button color="inherit" startIcon={<Replay />} onClick={fetchPlans}>Tentar novamente</Button>}>{error}</Alert>}

        {mobile ? (
          <Stack spacing={1.5}>
            {loading && [1, 2, 3].map((item) => <Skeleton key={item} variant="rounded" height={178} />)}
            {!loading && plans.map((plan) => (
              <Paper key={plan.id} sx={{ p: 2.25, border: `1px solid ${tokens.color.line}` }}>
                <Stack direction="row" alignItems="start" justifyContent="space-between" gap={2}>
                  <Box>
                    <Typography component="h3" variant="h5">{plan.name}</Typography>
                    <Typography variant="h4" sx={{ mt: 0.5, fontVariantNumeric: 'tabular-nums' }}>{currency.format(plan.price_brl)}<Typography component="span" color="text.secondary" variant="body2"> / mês</Typography></Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton aria-label={`Editar ${plan.name}`} onClick={() => openEdit(plan)}><EditOutlined /></IconButton>
                    <IconButton aria-label={`Excluir ${plan.name}`} color="error" onClick={() => setDeleteId(plan.id)}><DeleteOutline /></IconButton>
                  </Stack>
                </Stack>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', mt: 2, pt: 2, borderTop: `1px solid ${tokens.color.line}`, gap: 1 }}>
                  <Box><Typography variant="h5" sx={{ fontVariantNumeric: 'tabular-nums' }}>{plan.max_students}</Typography><Typography variant="body2" color="text.secondary">alunos</Typography></Box>
                  <Box><Typography variant="h5" sx={{ fontVariantNumeric: 'tabular-nums' }}>{plan.max_exercises}</Typography><Typography variant="body2" color="text.secondary">exercícios</Typography></Box>
                  <Box><Typography variant="h5" sx={{ fontVariantNumeric: 'tabular-nums' }}>{plan.max_training}</Typography><Typography variant="body2" color="text.secondary">treinos</Typography></Box>
                </Box>
              </Paper>
            ))}
            {!loading && plans.length === 0 && !error && (
              <Paper sx={{ p: 3, border: `1px solid ${tokens.color.line}` }}>
                <Typography variant="h5">Nenhum plano criado</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>Crie o primeiro plano para começar a cadastrar personals.</Typography>
                <Button startIcon={<Add />} onClick={openCreate} sx={{ mt: 2 }}>Criar plano</Button>
              </Paper>
            )}
          </Stack>
        ) : (
          <Paper sx={{ height: 620, border: `1px solid ${tokens.color.line}` }}>
            <DataGrid rows={plans} columns={columns} loading={loading} disableRowSelectionOnClick hideFooterSelectedRowCount />
          </Paper>
        )}
      </Stack>

      <SubscriptionForm plan={editing} open={formOpen} onClose={() => { setFormOpen(false); setEditing(undefined); }} onSubmit={submit} />
      <DeleteDialog title="Excluir plano" isOpen={Boolean(deleteId)} handleCloseDeleteDialog={confirmDelete} />
    </Template>
  );
}
