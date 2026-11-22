import { ArrowForward, FitnessCenterOutlined, PeopleOutline, SportsGymnasticsOutlined } from '@mui/icons-material';
import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import Template from '../../components/Template';
import { tokens } from '../../theme';

const steps = [
  { number: '01', title: 'Organize seus alunos', description: 'Cadastre acessos e acompanhe as fichas vinculadas.', path: '/students', action: 'Ver alunos', icon: <PeopleOutline /> },
  { number: '02', title: 'Monte sua biblioteca', description: 'Crie exercícios claros, com descanso, séries, instruções e vídeo.', path: '/exercises', action: 'Ver exercícios', icon: <FitnessCenterOutlined /> },
  { number: '03', title: 'Trace e pratique', description: 'Monte treinos para seus alunos ou execute uma ficha pessoal.', path: '/trainings', action: 'Ver treinos', icon: <SportsGymnasticsOutlined /> },
];

export default function Dashboard() {
  let firstName = 'Personal';
  try { firstName = JSON.parse(localStorage.getItem('user') || '{}')?.name?.split(' ')[0] || firstName; } catch { /* use fallback */ }

  return (
    <Template pageName="Início">
      <Stack spacing={{ xs: 4, md: 6 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0,1fr) 300px' }, alignItems: 'end', gap: 3 }}>
          <Box>
            <Typography component="h2" variant="h1" sx={{ maxWidth: 720 }}>Bom treino começa com uma rota clara, {firstName}.</Typography>
            <Typography color="text.secondary" sx={{ mt: 2, maxWidth: '65ch', fontSize: '1.1rem' }}>Organize a jornada do aluno da primeira orientação até a última série.</Typography>
          </Box>
          <Paper sx={{ p: 2.5, bgcolor: tokens.color.ink, color: '#FFFFFF' }}>
            <Typography fontWeight={800}>Fluxo do personal</Typography>
            <Typography sx={{ mt: 0.5, color: 'rgba(255,255,255,.72)' }}>Exercícios → treino pessoal ou publicado.</Typography>
          </Paper>
        </Box>

        <Paper sx={{ border: `1px solid ${tokens.color.line}`, overflow: 'hidden' }}>
          {steps.map((step, index) => (
            <Box key={step.path}>
              <Box sx={{ p: { xs: 2.5, md: 3.5 }, display: 'grid', gridTemplateColumns: { xs: '48px 1fr', sm: '64px 1fr auto' }, gap: 2, alignItems: 'center' }}>
                <Box sx={{ color: 'primary.main', fontWeight: 850, fontSize: '1.25rem', fontVariantNumeric: 'tabular-nums', alignSelf: 'start' }}>{step.number}</Box>
                <Box>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box sx={{ color: 'primary.main', display: 'grid' }}>{step.icon}</Box>
                    <Typography component="h3" variant="h4">{step.title}</Typography>
                  </Stack>
                  <Typography color="text.secondary" sx={{ mt: 0.75 }}>{step.description}</Typography>
                </Box>
                <Button component={Link} to={step.path} endIcon={<ArrowForward />} sx={{ gridColumn: { xs: '2', sm: 'auto' }, justifySelf: 'start' }}>{step.action}</Button>
              </Box>
              {index < steps.length - 1 && <Divider />}
            </Box>
          ))}
        </Paper>
      </Stack>
    </Template>
  );
}
