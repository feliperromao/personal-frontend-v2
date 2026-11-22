import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Replay, SwipeOutlined, TrendingDown, TrendingFlat, TrendingUp } from '@mui/icons-material';
import { Alert, Box, Button, Chip, Divider, Paper, Skeleton, Stack, TextField, Typography } from '@mui/material';
import Template from '../../components/Template';
import { EvolutionReport as EvolutionReportData, User, UserRole } from '../../domain/types';
import { tokens } from '../../theme';
import api from '../@shared/api';
import EvolutionChart from './EvolutionChart';

interface EvolutionReportProps {
  mode?: UserRole;
}

const loadNumber = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
const fullDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
const SELF_SUBJECT = 'self';

function formatLoad(value: number | null) {
  return value === null ? '—' : `${loadNumber.format(value)} kg`;
}

export default function EvolutionReport({ mode = 'STUDENT' }: EvolutionReportProps) {
  const personal = mode === 'PERSONAL';
  const [students, setStudents] = useState<User[]>([]);
  const [subjectId, setSubjectId] = useState(personal ? SELF_SUBJECT : '');
  const [report, setReport] = useState<EvolutionReportData | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(personal);
  const [loadingReport, setLoadingReport] = useState(true);
  const [error, setError] = useState('');
  const reportRequest = useRef<AbortController | null>(null);

  const loadReport = useCallback(async (selectedStudentId?: string, exerciseId?: string) => {
    reportRequest.current?.abort();
    const controller = new AbortController();
    reportRequest.current = controller;
    setLoadingReport(true);
    setError('');
    try {
      const studentId = personal && selectedStudentId && selectedStudentId !== SELF_SUBJECT
        ? selectedStudentId
        : undefined;
      const { data } = await api.get<EvolutionReportData>('/reports/evolution', {
        signal: controller.signal,
        params: {
          ...(studentId ? { student_id: studentId } : {}),
          ...(exerciseId ? { exercise_id: exerciseId } : {}),
        },
      });
      if (reportRequest.current === controller) setReport(data);
    } catch {
      if (controller.signal.aborted) return;
      setError('Não foi possível carregar a evolução. Verifique a conexão e tente novamente.');
    } finally {
      if (reportRequest.current === controller) setLoadingReport(false);
    }
  }, [personal]);

  useEffect(() => () => reportRequest.current?.abort(), []);

  const loadStudents = useCallback(async () => {
    setLoadingStudents(true);
    setError('');
    try {
      const { data } = await api.get<User[]>('/students/list-all');
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      setError('Não foi possível carregar seus alunos. Tente novamente.');
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  useEffect(() => {
    if (!personal) {
      loadReport();
      return;
    }

    loadStudents();
    loadReport(SELF_SUBJECT);
  }, [loadReport, loadStudents, personal]);

  const exercise = useMemo(
    () => report?.exercises.find((item) => item.id === report.selected_exercise_id),
    [report],
  );
  const change = report?.summary.absolute_change ?? null;
  const trend = change === null || change === 0
    ? { label: 'Carga estável', color: 'default' as const, icon: <TrendingFlat /> }
    : change > 0
      ? { label: `+${loadNumber.format(change)} kg desde o início`, color: 'success' as const, icon: <TrendingUp /> }
      : { label: `${loadNumber.format(change)} kg desde o início`, color: 'warning' as const, icon: <TrendingDown /> };

  const selectSubject = (nextSubjectId: string) => {
    setSubjectId(nextSubjectId);
    setReport(null);
    loadReport(nextSubjectId);
  };

  const selectExercise = (exerciseId: string) => {
    loadReport(personal ? subjectId : undefined, exerciseId);
  };

  const retry = () => {
    if (personal) loadStudents();
    loadReport(personal ? subjectId : undefined, report?.selected_exercise_id || undefined);
  };

  return (
    <Template type={mode} pageName="Relatórios">
      <Stack spacing={3.5} sx={{ maxWidth: 1120, mx: 'auto' }}>
        <Box>
          <Typography component="h2" variant="h2">{personal ? 'Evolução' : 'Minha evolução'}</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, maxWidth: '68ch' }}>
            {personal
              ? 'Acompanhe suas próprias cargas ou selecione um aluno para orientar os próximos ajustes de treino.'
              : 'Veja sua progressão de carga em cada exercício concluído e reconheça a consistência construída treino após treino.'}
          </Typography>
        </Box>

        <Paper sx={{ p: { xs: 2, sm: 2.5 }, border: `1px solid ${tokens.color.line}` }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: personal ? 'minmax(240px, 1fr) minmax(240px, 1fr)' : 'minmax(240px, 420px)' }, gap: 2 }}>
            {personal && (
              <TextField
                select
                SelectProps={{ native: true }}
                InputLabelProps={{ sx: { color: `${tokens.color.muted} !important` } }}
                FormHelperTextProps={{ sx: { color: 'text.secondary' } }}
                label="Visualizar evolução de"
                value={subjectId}
                disabled={loadingStudents}
                onChange={(event) => selectSubject(event.target.value)}
                helperText={loadingStudents ? 'Carregando alunos…' : 'Alterne entre seus treinos e os dos seus alunos'}
              >
                <option value={SELF_SUBJECT}>Minha evolução</option>
                {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
              </TextField>
            )}
            <TextField
              select
              SelectProps={{ native: true }}
              InputLabelProps={{ sx: { color: `${tokens.color.muted} !important` } }}
              FormHelperTextProps={{ sx: { color: 'text.secondary' } }}
              label="Exercício"
              value={report?.selected_exercise_id || ''}
              disabled={loadingReport || !report?.exercises.length}
              onChange={(event) => selectExercise(event.target.value)}
              helperText={report?.exercises.length ? `${report.exercises.length} exercícios com histórico` : 'Aparecem aqui somente exercícios já executados'}
            >
              <option value="">Selecione um exercício</option>
              {report?.exercises.map((item) => (
                <option key={item.id} value={item.id}>{item.name} · {item.executions} {item.executions === 1 ? 'execução' : 'execuções'}</option>
              ))}
            </TextField>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" action={<Button color="inherit" startIcon={<Replay />} onClick={retry}>Tentar novamente</Button>}>
            {error}
          </Alert>
        )}

        {loadingReport ? (
          <Stack spacing={2} aria-label="Carregando evolução">
            <Skeleton variant="rounded" height={430} />
            <Skeleton variant="rounded" height={180} />
          </Stack>
        ) : report && report.exercises.length === 0 ? (
          <Paper sx={{ p: { xs: 3, sm: 5 }, border: `1px solid ${tokens.color.line}` }}>
            <Typography variant="h4">Ainda não há evolução para mostrar</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: '60ch' }}>
              Quando {report.subject.type === 'PERSONAL' || !personal ? 'você' : report.subject.name} concluir séries com carga registrada, os primeiros pontos aparecerão aqui.
            </Typography>
          </Paper>
        ) : report && exercise ? (
          <>
            <Paper component="section" aria-labelledby="evolution-chart-title" sx={{ border: `1px solid ${tokens.color.line}`, overflow: 'hidden' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} sx={{ p: { xs: 2.25, sm: 3 } }}>
                <Box>
                  <Typography id="evolution-chart-title" component="h3" variant="h3">{exercise.name}</Typography>
                  <Typography color="text.secondary">Maior carga concluída em cada sessão</Typography>
                </Box>
                <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <Typography variant="h2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatLoad(report.summary.current_load)}
                  </Typography>
                  <Chip icon={trend.icon} label={trend.label} color={trend.color} variant={trend.color === 'default' ? 'outlined' : 'filled'} />
                </Stack>
              </Stack>
              <Divider />
              <Box sx={{ px: { xs: 0.5, sm: 2 }, py: 2 }}>
                <EvolutionChart points={report.points} exerciseName={exercise.name} />
                {report.points.length > 4 && (
                  <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center" sx={{ display: { sm: 'none' }, color: 'text.secondary' }}>
                    <SwipeOutlined fontSize="small" />
                    <Typography variant="body2">Deslize para rever as sessões anteriores</Typography>
                  </Stack>
                )}
                {report.points.length === 1 && <Typography color="text.secondary" textAlign="center">A próxima execução formará a primeira linha de evolução.</Typography>}
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, borderTop: `1px solid ${tokens.color.line}` }}>
                {[
                  ['Primeira carga', formatLoad(report.summary.initial_load)],
                  ['Recorde', formatLoad(report.summary.personal_best)],
                  ['Execuções', String(report.summary.total_executions)],
                  ['Séries registradas', String(report.summary.total_series)],
                ].map(([label, value], index) => (
                  <Box key={label} sx={{ p: 2, borderRight: { xs: index % 2 === 0 ? `1px solid ${tokens.color.line}` : 0, md: index < 3 ? `1px solid ${tokens.color.line}` : 0 }, borderBottom: { xs: index < 2 ? `1px solid ${tokens.color.line}` : 0, md: 0 } }}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="h4" sx={{ mt: 0.25, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            <Box component="section" aria-labelledby="history-title">
              <Typography id="history-title" component="h3" variant="h3">Números por treino</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75, mb: 2 }}>A linha usa a maior carga; abaixo você confere todas as séries registradas.</Typography>
              <Paper sx={{ border: `1px solid ${tokens.color.line}`, overflow: 'hidden' }}>
                <Stack divider={<Divider flexItem />}>
                  {[...report.points].reverse().map((point) => (
                    <Box key={point.progress_id} sx={{ p: { xs: 2, sm: 2.5 }, display: 'grid', gridTemplateColumns: { xs: '1fr auto', sm: '140px minmax(0, 1fr) auto' }, gap: { xs: 1, sm: 2 }, alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}>{fullDate.format(new Date(point.executed_at))}</Typography>
                      <Box minWidth={0}>
                        <Typography fontWeight={750} sx={{ overflowWrap: 'anywhere' }}>{point.training_name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {point.completed_series} de {point.planned_series} séries · cargas: {point.loads.map((load) => loadNumber.format(load)).join(' · ')} kg
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary">Melhor da sessão</Typography>
                        <Typography variant="h4" sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{formatLoad(point.max_load)}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Box>
          </>
        ) : null}
      </Stack>
    </Template>
  );
}
