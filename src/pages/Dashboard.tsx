import React from 'react';
import { Grid, Paper } from '@mui/material';
import Template from '../components/Template';

const Dashboard: React.FC = () => {
  return (
    <Template pageName='Dashboard' >
      <Grid container spacing={3}>
        {/* Chart */}
        <Grid item xs={12} md={8} lg={9}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <h1>Total de Alunos: {100}</h1>
          </Paper>
        </Grid>
        {/* Recent Deposits */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
          </Paper>
        </Grid>
        {/* Recent Orders */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <p>Proximo aluno:</p> <h3>José Felipe as 16:30</h3>
          </Paper>
        </Grid>
      </Grid>
    </Template>
  );
};

export default Dashboard;
