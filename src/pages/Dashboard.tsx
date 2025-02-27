import React from 'react';
import PeopleIcon from '@mui/icons-material/People';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import Template from '../components/Template';
import { Container, Row } from '../components/Grid';
import PageCard from '../components/PageCard';

const Dashboard: React.FC = () => {
  return (
    <Template pageName='Dashboard' >
      <Container mt={2} spacing={1}>
        <Row sm={6} md={4}>
          <PageCard
            title='Alunos'
            description='Cadastre novos alunos nesse menu'
            link='/students'
            icon={<PeopleIcon />}
            image='/img/3538371.jpg'
          />
        </Row>
        <Row sm={6} md={4}>
          <PageCard
            title='Exercicios'
            description='Aqui ficam todos os exercicios que voce criar'
            link='/exercises'
            icon={<FitnessCenterIcon />}
            image='/img/3297251.jpg'
          />
        </Row>
        <Row sm={6} md={4}>
          <PageCard
            title='Treinos' description='Os treinos que você cria para seus alunos...'
            link='/exercises'
            icon={<SportsGymnasticsIcon />}
            image='/img/11409104.jpg'
          />
        </Row>
      </Container>
    </Template>
  );
}

export default Dashboard;
