import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PeopleIcon from '@mui/icons-material/People';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import { useNavigate } from 'react-router-dom';
import { Dashboard, Logout } from '@mui/icons-material';

export const PersonalMenu = () => {
  const navigate = useNavigate();
  return (
    <React.Fragment>
      <ListItemButton onClick={() => navigate('/')}>
        <ListItemIcon><Dashboard /></ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItemButton>

      <ListItemButton onClick={() => navigate('/students')}>
        <ListItemIcon><PeopleIcon /></ListItemIcon>
        <ListItemText primary="Alunos" />
      </ListItemButton>

      <ListItemButton onClick={() => navigate('/exercises')}>
        <ListItemIcon><FitnessCenterIcon /></ListItemIcon>
        <ListItemText primary="Exercícios" />
      </ListItemButton>

      <ListItemButton onClick={() => navigate('/trainings')}>
        <ListItemIcon><SportsGymnasticsIcon /></ListItemIcon>
        <ListItemText primary="Treinos" />
      </ListItemButton>
    </React.Fragment>
  );
}

export const StudentMenu = () => {
  const navigate = useNavigate();
  return (
    <React.Fragment>
      <ListItemButton onClick={() => navigate('/my-workouts')}>
        <ListItemIcon><SportsGymnasticsIcon /></ListItemIcon>
        <ListItemText primary="Meus Treinos" />
      </ListItemButton>
    </React.Fragment>
  );
}

export const SecondaryNavgation = () => {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('auth-token');
    navigate('/login')
  }
  return (
    <React.Fragment>
      <ListItemButton onClick={() => logout()}>
        <ListItemIcon><Logout /></ListItemIcon>
        <ListItemText primary="Sair" />
      </ListItemButton>
    </React.Fragment>
  );
}
