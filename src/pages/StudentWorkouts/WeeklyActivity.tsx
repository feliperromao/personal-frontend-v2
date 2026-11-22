import { CheckRounded } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { tokens } from '../../theme';

const weekDayLabels = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

export interface WeekDay {
  date: Date;
  key: string;
  shortLabel: string;
}

interface WeeklyActivityProps {
  completedAt: string[];
  loading?: boolean;
  referenceDate?: Date;
}

export function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getWeekRange(referenceDate = new Date()) {
  const start = new Date(referenceDate);
  const daysSinceMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - daysSinceMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return { start, end };
}

export function getWeekDays(referenceDate = new Date()): WeekDay[] {
  const { start } = getWeekRange(referenceDate);
  return weekDayLabels.map((shortLabel, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    return { date, key: getLocalDateKey(date), shortLabel };
  });
}

function formatWeekRange(days: WeekDay[]) {
  const first = days[0].date;
  const last = days[days.length - 1].date;
  const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long' });

  if (first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()) {
    return `${first.getDate()} a ${last.getDate()} de ${monthFormatter.format(last)}`;
  }

  return `${first.getDate()} de ${monthFormatter.format(first)} a ${last.getDate()} de ${monthFormatter.format(last)}`;
}

export default function WeeklyActivity({ completedAt, loading = false, referenceDate = new Date() }: WeeklyActivityProps) {
  const days = getWeekDays(referenceDate);
  const todayKey = getLocalDateKey(referenceDate);
  const completedDays = new Set(
    completedAt
      .map((value) => new Date(value))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map(getLocalDateKey),
  );
  const completedDayCount = days.filter((day) => completedDays.has(day.key)).length;
  const activityLabel = `${completedDayCount} ${completedDayCount === 1 ? 'dia' : 'dias'} com treino`;
  const fullDateFormatter = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  if (loading) {
    return <Skeleton aria-label="Carregando atividade da semana" variant="rounded" height={168} />;
  }

  return (
    <Paper component="section" aria-labelledby="weekly-activity-title" sx={{ p: { xs: 2, sm: 2.5 }, border: `1px solid ${tokens.color.line}` }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2}>
        <Box>
          <Typography id="weekly-activity-title" component="h3" variant="h4">Sua semana</Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 0.25 }}>
            {formatWeekRange(days)}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{ color: completedDayCount > 0 ? 'success.main' : 'text.secondary', fontWeight: 750, textAlign: 'right' }}
        >
          {activityLabel}
        </Typography>
      </Stack>

      <Box
        role="list"
        aria-label="Treinos realizados nesta semana"
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          position: 'relative',
          mt: 2.25,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 41,
            left: '7%',
            right: '7%',
            height: 2,
            bgcolor: 'divider',
          },
        }}
      >
        {days.map((day) => {
          const completed = completedDays.has(day.key);
          const today = day.key === todayKey;
          const spokenDate = fullDateFormatter.format(day.date);

          return (
            <Box
              key={day.key}
              role="listitem"
              aria-current={today ? 'date' : undefined}
              aria-label={`${spokenDate}: ${completed ? 'treino realizado' : 'nenhum treino registrado'}`}
              sx={{ display: 'grid', justifyItems: 'center', gap: 0.75, minWidth: 0 }}
            >
              <Typography
                aria-hidden="true"
                variant="body2"
                sx={{ color: today ? 'primary.main' : 'text.secondary', fontWeight: today ? 800 : 700, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
              >
                {day.shortLabel}
              </Typography>
              <Box
                aria-hidden="true"
                sx={{
                  width: 36,
                  height: 36,
                  display: 'grid',
                  placeItems: 'center',
                  position: 'relative',
                  zIndex: 1,
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: completed ? 'success.main' : today ? 'primary.main' : 'divider',
                  bgcolor: completed ? 'success.main' : 'background.paper',
                  color: '#FFFFFF',
                  boxShadow: today && !completed ? `0 0 0 3px ${alpha(tokens.color.primary, 0.12)}` : 'none',
                }}
              >
                {completed && <CheckRounded sx={{ fontSize: 22 }} />}
              </Box>
              <Typography
                aria-hidden="true"
                sx={{ color: today ? 'primary.main' : 'text.primary', fontWeight: today || completed ? 800 : 650, fontVariantNumeric: 'tabular-nums' }}
              >
                {day.date.getDate()}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
