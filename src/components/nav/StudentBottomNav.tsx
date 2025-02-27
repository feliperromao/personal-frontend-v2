import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import Logout from '@mui/icons-material/Logout';

const StudentBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const routeMap: { [key: string]: number } = {
    '/my-workouts': 3,
  };

  const [value, setValue] = React.useState(routeMap[location.pathname] || 0);

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
          const paths = ['/my-workouts'];
          navigate(paths[newValue]);
        }}
        sx={{height: 70}}
      >
        <BottomNavigationAction label="Meus treinos" icon={<SportsGymnasticsIcon />} />
        <BottomNavigationAction label="Sair" icon={<Logout />} />
      </BottomNavigation>
    </Box>
  );
}

export default StudentBottomNav;