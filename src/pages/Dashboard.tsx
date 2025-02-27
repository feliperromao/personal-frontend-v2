import React from 'react';
import PeopleIcon from '@mui/icons-material/People';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import Template from '../components/Template';
import PageCard from '../components/PageCard';
import { Grid } from '@mui/material';

const Dashboard: React.FC = () => {
  return (
    <Template pageName='Dashboard' >
      <Grid container mt={2} spacing={1} sx={{display: 'flex', justifyContent: 'center'}}>
        <Grid item sm={6} md={4}>
          <PageCard
            title='Alunos'
            description='Cadastre novos alunos nesse menu'
            link='/students'
            icon={<PeopleIcon />}
            image='/img/3538371.jpg'
          />
        </Grid>
        <Grid sm={6} md={4}>
          <PageCard
            title='Exercicios'
            description='Aqui ficam todos os exercicios que voce criar'
            link='/exercises'
            icon={<FitnessCenterIcon />}
            image='/img/3297251.jpg'
          />
        </Grid>
        <Grid sm={6} md={4}>
          <PageCard
            title='Treinos' description='Os treinos que você cria para seus alunos...'
            link='/trainings'
            icon={<SportsGymnasticsIcon />}
            image='/img/11409104.jpg'
          />
        </Grid>
      </Grid>
    </Template>
  );
}

export default Dashboard;
