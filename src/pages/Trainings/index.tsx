import { useCallback, useEffect, useState } from 'react';
import { DeleteOutline, EditOutlined, NavigateBefore, NavigateNext, Replay } from '@mui/icons-material';
import { Alert, Autocomplete, Box, Button, Chip, IconButton, Paper, Skeleton, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel, GridRowId } from '@mui/x-data-grid';
import DeleteDialog from '../../components/DeleteDialog';
import FloatingButton from '../../components/FloatingButton';
import SearchInput from '../../components/forms/SearchInput';
import ItemsMenu from '../../components/table/ItemsMenu';
import Template from '../../components/Template';
import { Training, TrainingInput, User } from '../../domain/types';
import { tokens } from '../../theme';
import api from '../@shared/api';
import { paginationModel } from '../@shared/pagination';
import TrainingForm, { Option, toTrainingInput } from './TrainingForm';
import { handleOpenNotification, SNACKBAR_TYPES } from '../../components/MySnackbar';

const URL = '/trainings';

export default function Trainings() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [items, setItems] = useState<Training[]>([]);
  const [students, setStudents] = useState<Option[]>([]);
  const [student, setStudent] = useState<Option | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Training>();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await api.get(URL, { params: { page: page + 1, search, student_id: student?.value || '' } });
      setItems(response.data.data || []); setRowCount(response.data.total_documents ?? response.data.data?.length ?? 0);
    } catch { setError('Não foi possível carregar os treinos. Verifique a conexão e tente novamente.'); }
    finally { setLoading(false); }
  }, [page, search, student?.value]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => {
    api.get('/students/list-all').then(({ data }) => setStudents(data.map((user: User) => ({ label: user.name, value: user.id || '' })))).catch(() => setError('Os treinos foram carregados, mas a lista de alunos não está disponível.'));
  }, []);

  const edit = (id: GridRowId) => { setEditing(items.find((item) => item.id === id.toString())); setFormOpen(true); };
  const submit = async (training: TrainingInput) => {
    const payload = toTrainingInput(training);
    try {
      if (editing?.id) await api.put(`${URL}/${editing.id}`, payload); else await api.post(URL, payload);
      handleOpenNotification(editing ? 'Treino atualizado com sucesso.' : 'Treino criado com sucesso.', SNACKBAR_TYPES.success);
      setFormOpen(false); setEditing(undefined); await fetchItems();
    } catch (requestError) { handleOpenNotification('Não foi possível salvar o treino.', SNACKBAR_TYPES.error); throw requestError; }
  };
  const confirmDelete = async (confirm: boolean) => {
    if (confirm && deleteId) {
      try { await api.delete(`${URL}/${deleteId}`); await fetchItems(); }
      catch { handleOpenNotification('Não foi possível excluir o treino.', SNACKBAR_TYPES.error); }
    }
    setDeleteId(null);
  };
  const studentName = (id: string) => students.find((item) => item.value === id)?.label || 'Aluno não encontrado';
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 200 },
    { field: 'description', headerName: 'Descrição', flex: 1.4, minWidth: 260 },
    { field: 'student_id', headerName: 'Aluno', flex: 1, minWidth: 180, valueGetter: (value) => studentName(String(value)) },
    { field: 'show_to_student', headerName: 'Visível', width: 100, valueFormatter: (value) => value ? 'Sim' : 'Não' },
    { field: 'actions', type: 'actions', headerName: 'Ações', width: 90, getActions: ({ id }) => [<ItemsMenu key={id} rowId={id} handleDelete={() => setDeleteId(id.toString())} handleEdit={() => edit(id)} />] },
  ];

  return (
    <Template pageName="Treinos">
      <Stack spacing={3}>
        <Box><Typography component="h2" variant="h2">Treinos</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Ordene os exercícios e libere cada ficha quando estiver pronta.</Typography></Box>
        <SearchInput handleChange={setSearch} handleSearch={() => { setPage(0); fetchItems(); }} append={
          <Autocomplete options={students} value={student} onChange={(_, value) => { setStudent(value); setPage(0); }} sx={{ minWidth: { xs: '100%', sm: 220 } }} renderInput={(params) => <TextField {...params} label="Filtrar por aluno" size="small" />} />
        } />
        {error && <Alert severity="error" action={<Button color="inherit" startIcon={<Replay />} onClick={fetchItems}>Tentar novamente</Button>}>{error}</Alert>}
        {mobile ? (
          <Stack spacing={1.5}>
            {loading ? [1, 2, 3].map((item) => <Skeleton key={item} variant="rounded" height={176} />) : items.map((training) => (
              <Paper key={training.id} sx={{ p: 2.25, border: `1px solid ${tokens.color.line}` }}>
                <Stack direction="row" justifyContent="space-between" gap={2}><Typography component="h3" variant="h5">{training.name}</Typography><Chip size="small" color={training.show_to_student ? 'success' : 'default'} label={training.show_to_student ? 'Publicado' : 'Rascunho'} /></Stack>
                <Typography color="text.secondary" sx={{ mt: 1 }}>{training.description}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>{studentName(training.student_id)} · {training.exercises?.length || 0} exercícios</Typography>
                <Stack direction="row" justifyContent="flex-end" spacing={0.5} sx={{ mt: 1 }}><IconButton aria-label={`Editar ${training.name}`} onClick={() => edit(training.id || '')}><EditOutlined /></IconButton><IconButton aria-label={`Excluir ${training.name}`} color="error" onClick={() => setDeleteId(training.id || null)}><DeleteOutline /></IconButton></Stack>
              </Paper>
            ))}
            {!loading && items.length === 0 && !error && <Paper sx={{ p: 3, border: `1px solid ${tokens.color.line}` }}><Typography variant="h5">Nenhum treino encontrado</Typography><Typography color="text.secondary">Ajuste a busca ou crie a primeira ficha.</Typography></Paper>}
            <Stack direction="row" alignItems="center" justifyContent="space-between"><Button startIcon={<NavigateBefore />} disabled={page === 0 || loading} onClick={() => setPage((value) => Math.max(0, value - 1))}>Anterior</Button><Typography variant="body2">Página {page + 1}</Typography><Button endIcon={<NavigateNext />} disabled={(page + 1) * 10 >= rowCount || loading} onClick={() => setPage((value) => value + 1)}>Próxima</Button></Stack>
          </Stack>
        ) : <Paper sx={{ height: 620, border: `1px solid ${tokens.color.line}` }}><DataGrid rows={items} columns={columns} loading={loading} initialState={{ pagination: { paginationModel } }} paginationMode="server" rowCount={rowCount} onPaginationModelChange={(model: GridPaginationModel) => setPage(model.page)} disableRowSelectionOnClick /></Paper>}
      </Stack>
      <FloatingButton onClick={() => { setEditing(undefined); setFormOpen(true); }} />
      <TrainingForm training={editing} isOpen={formOpen} onSubmit={submit} handleClose={() => { setFormOpen(false); setEditing(undefined); }} students={students} />
      <DeleteDialog title="Excluir treino" handleCloseDeleteDialog={confirmDelete} isOpen={Boolean(deleteId)} />
    </Template>
  );
}
