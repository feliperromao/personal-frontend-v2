import * as React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { AppBar } from './nav/AppBar';
import { PersonalMenu, SecondaryNavgation, StudentMenu } from './nav/Navgation';
import MySnackbar from './MySnackbar';
import { Backdrop, CircularProgress, useMediaQuery } from '@mui/material';
import { useGlobalState } from "../GlobalState";
import PersonalBottomNav from './nav/PersonalBottomNav';
import StudentBottomNav from './nav/StudentBottomNav';

interface PageTemplateProps {
  pageName: string;
  children: React.ReactNode;
  type?: "PERSONAL" | "STUDENT"
}

const drawerWidth: number = 240;

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);


const defaultTheme = createTheme();

const Template: React.FC<PageTemplateProps> = ({ children, pageName, type }) => {
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null
  const { loading, drawerOpen, setDrawerOpen } = useGlobalState();
  const isMobile = useMediaQuery('(max-width:600px)');
  const toggleDrawer = () => {
    localStorage.setItem("drawerOpen", !drawerOpen ? "1": "")
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="absolute" open={drawerOpen}>
          <Toolbar
            sx={{
              pr: '24px',
            }}
          >
            {!isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={toggleDrawer}
                sx={{
                  marginRight: '36px',
                  ...(drawerOpen && { display: 'none' }),
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              {pageName}
            </Typography>
            <IconButton color="inherit">
              <Badge badgeContent={0} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>

        {!isMobile && (
          <Drawer variant="permanent" open={drawerOpen}>
            <Toolbar
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                px: [1],
                backgroundColor: 'secondary'
              }}
            >
              <Typography
                component="h1"
                variant="h6"
                color="primary"
                noWrap
                style={{ fontWeight: '800' }}
              >MyPersonal.App</Typography>
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            <Divider />
            <List component="nav">
              {type === "STUDENT" ? <StudentMenu /> : <PersonalMenu />}
            </List>
            <Divider />
            <List component="nav">
              <SecondaryNavgation />
            </List>
          </Drawer>
        )}
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          {!isMobile && <Toolbar />}
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {children}
          </Container>
        </Box>
      </Box>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <MySnackbar />
      {isMobile && ( user?.type === "PERSONAL" ? <PersonalBottomNav /> : <StudentBottomNav />)}
    </ThemeProvider>
  );
}

export default Template;