import { useCallback, useEffect, useState } from 'react';
import { DeleteOutline, EditOutlined, NavigateBefore, NavigateNext, Replay } from '@mui/icons-material';
import { Alert, Box, Button, Chip, FormControl, IconButton, MenuItem, Paper, Select, Skeleton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel, GridRowId } from '@mui/x-data-grid';
import DeleteDialog from '../../components/DeleteDialog';
import FloatingButton from '../../components/FloatingButton';
import SearchInput from '../../components/forms/SearchInput';
import ItemsMenu from '../../components/table/ItemsMenu';
import Template from '../../components/Template';
import { Exercise, ExerciseInput, exerciseCategories } from '../../domain/types';
import { tokens } from '../../theme';
import api from '../@shared/api';
import { paginationModel } from '../@shared/pagination';
import ExerciseForm from './ExerciseForm';
import { handleOpenNotification, SNACKBAR_TYPES } from '../../components/MySnackbar';

const URL = '/exercises';

export default function Exercises() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [items, setItems] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(0);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Exercise>();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await api.get(URL, { params: { page: page + 1, search, exercise_type: type } });
      setItems(response.data.data || []); setRowCount(response.data.total_documents || 0);
    } catch { setError('Não foi possível carregar os exercícios. Verifique a conexão e tente novamente.'); }
    finally { setLoading(false); }
  }, [page, search, type]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const edit = (id: GridRowId) => { setEditing(items.find((item) => item.id === id.toString())); setFormOpen(true); };
  const submit = async (exercise: ExerciseInput) => {
    const payload: ExerciseInput = { ...exercise, rest: Number(exercise.rest), series: Number(exercise.series) };
    try {
      if (editing?.id) await api.put(`${URL}/${editing.id}`, payload); else await api.post(URL, payload);
      handleOpenNotification(editing ? 'Exercício atualizado com sucesso.' : 'Exercício criado com sucesso.', SNACKBAR_TYPES.success);
      setFormOpen(false); setEditing(undefined); await fetchItems();
    } catch (requestError) { handleOpenNotification('Não foi possível salvar o exercício.', SNACKBAR_TYPES.error); throw requestError; }
  };
  const confirmDelete = async (confirm: boolean) => {
    if (confirm && deleteId) {
      try { await api.delete(`${URL}/${deleteId}`); await fetchItems(); }
      catch { handleOpenNotification('Não foi possível excluir o exercício.', SNACKBAR_TYPES.error); }
    }
    setDeleteId(null);
  };
  const category = (value: string) => exerciseCategories.find((item) => item.name === value)?.type || value;
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 220 },
    { field: 'type', headerName: 'Grupo', width: 150, valueFormatter: (value) => category(String(value)) },
    { field: 'series', headerName: 'Séries', width: 90 },
    { field: 'rest', headerName: 'Descanso', width: 110, valueFormatter: (value) => `${value}s` },
    { field: 'actions', type: 'actions', headerName: 'Ações', width: 90, getActions: ({ id }) => [<ItemsMenu key={id} rowId={id} handleDelete={() => setDeleteId(id.toString())} handleEdit={() => edit(id)} />] },
  ];

  return (
    <Template pageName="Exercícios">
      <Stack spacing={3}>
        <Box><Typography component="h2" variant="h2">Biblioteca de exercícios</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Instruções objetivas deixam a execução mais segura e consistente.</Typography></Box>
        <SearchInput handleChange={setSearch} handleSearch={() => { setPage(0); fetchItems(); }} append={
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
            <Select value={type} onChange={(event) => { setType(event.target.value); setPage(0); }} displayEmpty inputProps={{ 'aria-label': 'Filtrar por grupo muscular' }}>
              <MenuItem value="">Todos os grupos</MenuItem>
              {exerciseCategories.map((item) => <MenuItem key={item.name} value={item.name}>{item.type}</MenuItem>)}
            </Select>
          </FormControl>
        } />
        {error && <Alert severity="error" action={<Button color="inherit" startIcon={<Replay />} onClick={fetchItems}>Tentar novamente</Button>}>{error}</Alert>}
        {mobile ? (
          <Stack spacing={1.5}>
            {loading ? [1, 2, 3].map((item) => <Skeleton key={item} variant="rounded" height={170} />) : items.map((exercise) => (
              <Paper key={exercise.id} sx={{ p: 2.25, border: `1px solid ${tokens.color.line}` }}>
                <Stack direction="row" justifyContent="space-between" gap={2}><Typography component="h3" variant="h5">{exercise.name}</Typography><Chip size="small" label={category(exercise.type)} /></Stack>
                {exercise.instructions && <Typography color="text.secondary" sx={{ mt: 1 }}>{exercise.instructions}</Typography>}
                <Typography variant="body2" sx={{ mt: 1 }}>{exercise.series} séries · {exercise.rest}s de descanso</Typography>
                <Stack direction="row" justifyContent="flex-end" spacing={0.5} sx={{ mt: 1 }}><IconButton aria-label={`Editar ${exercise.name}`} onClick={() => edit(exercise.id)}><EditOutlined /></IconButton><IconButton aria-label={`Excluir ${exercise.name}`} color="error" onClick={() => setDeleteId(exercise.id)}><DeleteOutline /></IconButton></Stack>
              </Paper>
            ))}
            {!loading && items.length === 0 && !error && <Paper sx={{ p: 3, border: `1px solid ${tokens.color.line}` }}><Typography variant="h5">Nenhum exercício encontrado</Typography><Typography color="text.secondary">Ajuste os filtros ou crie o primeiro exercício.</Typography></Paper>}
            <Stack direction="row" alignItems="center" justifyContent="space-between"><Button startIcon={<NavigateBefore />} disabled={page === 0 || loading} onClick={() => setPage((value) => Math.max(0, value - 1))}>Anterior</Button><Typography variant="body2">Página {page + 1}</Typography><Button endIcon={<NavigateNext />} disabled={(page + 1) * 10 >= rowCount || loading} onClick={() => setPage((value) => value + 1)}>Próxima</Button></Stack>
          </Stack>
        ) : (
          <Paper sx={{ height: 620, border: `1px solid ${tokens.color.line}` }}><DataGrid rows={items} columns={columns} loading={loading} initialState={{ pagination: { paginationModel } }} paginationMode="server" rowCount={rowCount} onPaginationModelChange={(model: GridPaginationModel) => setPage(model.page)} disableRowSelectionOnClick /></Paper>
        )}
      </Stack>
      <ExerciseForm exercise={editing} isOpen={formOpen} onSubmit={submit} handleClose={() => { setFormOpen(false); setEditing(undefined); }} />
      <DeleteDialog title="Excluir exercício" handleCloseDeleteDialog={confirmDelete} isOpen={Boolean(deleteId)} />
      <FloatingButton onClick={() => { setEditing(undefined); setFormOpen(true); }} />
    </Template>
  );
}
