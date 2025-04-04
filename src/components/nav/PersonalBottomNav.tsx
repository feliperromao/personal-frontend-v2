import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import PeopleIcon from '@mui/icons-material/People';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import Logout from '@mui/icons-material/Logout';

const PersonalBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeMap: { [key: string]: number } = {
    '/': 0,
    '/students': 1,
    '/exercises': 2,
    '/trainings': 3,
  };

  const [value, setValue] = React.useState(routeMap[location.pathname] || 0);

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('auth-token');
    navigate('/login')
  }

  useEffect(() => {
    setValue(routeMap[location.pathname] || 0);
  }, [location.pathname]);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          const paths = ['/', '/students', '/exercises', '/trainings'];
          navigate(paths[newValue]);
        }}
        sx={{height: 70}}
      >
        <BottomNavigationAction label="Dashboard" icon={<DashboardIcon />} />
        <BottomNavigationAction label="Alunos" icon={<PeopleIcon />} />
        <BottomNavigationAction label="Exercícios" icon={<FitnessCenterIcon />} />
        <BottomNavigationAction label="Treinos" icon={<SportsGymnasticsIcon />} />
        <BottomNavigationAction onClick={logout} label="Sair" icon={<Logout />} />
      </BottomNavigation>
    </Box>
  );
}

export default PersonalBottomNav;