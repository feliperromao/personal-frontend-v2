import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AccountCircleOutlined,
  ArrowBack,
  AddToHomeScreenOutlined,
  FitnessCenterOutlined,
  HomeOutlined,
  LogoutOutlined,
  PeopleOutline,
  PersonOutline,
  SportsGymnasticsOutlined,
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGlobalState } from '../GlobalState';
import { UserRole } from '../domain/types';
import { usePwa } from '../platform/PwaContext';
import { tokens } from '../theme';
import BrandMark from './BrandMark';
import MySnackbar from './MySnackbar';
import { useBranding } from '../branding/BrandingContext';
import { alpha } from '@mui/material/styles';

interface PageTemplateProps {
  pageName: string;
  children: React.ReactNode;
  type?: UserRole;
  fullBleed?: boolean;
}

const drawerWidth = 264;

const personalItems = [
  { label: 'Início', path: '/', icon: <HomeOutlined /> },
  { label: 'Alunos', path: '/students', icon: <PeopleOutline /> },
  { label: 'Exercícios', path: '/exercises', icon: <FitnessCenterOutlined /> },
  { label: 'Treinos', path: '/trainings', icon: <SportsGymnasticsOutlined /> },
];

const studentItems = [
  { label: 'Meus treinos', path: '/my-workouts', icon: <SportsGymnasticsOutlined /> },
  { label: 'Perfil', path: '/profile', icon: <PersonOutline /> },
];

function pathIsActive(current: string, target: string) {
  if (target === '/') return current === '/';
  return current === target || current.startsWith(`${target}/`);
}

export default function Template({ children, pageName, type, fullBleed = false }: PageTemplateProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { loading } = useGlobalState();
  const { branding, resetBranding } = useBranding();
  const { online, canInstall, isIOS, isStandalone, dismissed, promptInstall, dismissInstall } = usePwa();
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
  const [installOpen, setInstallOpen] = useState(false);
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}') as { name?: string; email?: string; type?: UserRole }; }
    catch { return {}; }
  }, []);
  const role = type || user.type || 'PERSONAL';
  const navItems = role === 'STUDENT' ? studentItems : personalItems;
  const activeWorkoutHeader = isMobile && location.pathname.includes('/exercises/');
  const footerTextColor = theme.palette.getContrastText(branding.footerColor);

  useEffect(() => {
    const pending = localStorage.getItem('install-prompt-pending') === '1';
    if (pending && !dismissed && !isStandalone && (canInstall || isIOS)) setInstallOpen(true);
  }, [canInstall, dismissed, isIOS, isStandalone]);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth-token');
    resetBranding();
    navigate('/login', { replace: true });
  };

  const handleInstall = async () => {
    if (isIOS && !canInstall) return;
    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      localStorage.removeItem('install-prompt-pending');
      setInstallOpen(false);
    }
  };

  const openInstall = () => {
    setAccountAnchor(null);
    setInstallOpen(true);
  };

  const accountButton = (
    <IconButton
      aria-label="Abrir menu da conta"
      aria-controls={accountAnchor ? 'account-menu' : undefined}
      aria-expanded={Boolean(accountAnchor)}
      onClick={(event) => setAccountAnchor(event.currentTarget)}
      sx={{ color: 'text.primary' }}
    >
      <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 15, fontWeight: 800 }}>
        {(user.name || 'MP').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
      </Avatar>
    </IconButton>
  );

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', display: 'flex' }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'fixed', top: 8, left: 8, zIndex: 2000, bgcolor: 'primary.main', color: 'primary.contrastText',
          px: 2, py: 1, borderRadius: 1, transform: 'translateY(-160%)', '&:focus': { transform: 'translateY(0)' },
        }}
      >
        Pular para o conteúdo
      </Box>

      {!isMobile && (
        <Box
          component="aside"
          aria-label="Navegação principal"
          sx={{
            width: drawerWidth, position: 'fixed', inset: 0, right: 'auto', bgcolor: branding.footerColor, color: footerTextColor,
            px: 2, pt: 3, pb: 2, display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.drawer,
          }}
        >
          <Box sx={{ px: 1, mb: 5 }}><BrandMark inverse foregroundColor={footerTextColor} /></Box>
          <List component="nav" sx={{ display: 'grid', gap: 0.5 }}>
            {navItems.map((item) => (
              <ListItemButton
                key={item.path}
                component={Link}
                to={item.path}
                selected={pathIsActive(location.pathname, item.path)}
                sx={{
                  minHeight: 48, borderRadius: 1.5, color: footerTextColor,
                  '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 40 },
                  '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } },
                  '&:hover': { bgcolor: alpha(footerTextColor, 0.09) },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 700 }} />
              </ListItemButton>
            ))}
          </List>
          <Box sx={{ mt: 'auto' }}>
            <Divider sx={{ borderColor: alpha(footerTextColor, 0.18), mb: 2 }} />
            <Button
              fullWidth
              startIcon={<AccountCircleOutlined />}
              onClick={(event) => setAccountAnchor(event.currentTarget)}
              sx={{ color: footerTextColor, justifyContent: 'flex-start' }}
            >
              Conta
            </Button>
          </Box>
        </Box>
      )}

      <Box sx={{ flex: 1, minWidth: 0, ml: { md: `${drawerWidth}px` }, pb: { xs: 'calc(var(--app-bottom-nav) + env(safe-area-inset-bottom))', md: 0 } }}>
        <Box
          component="header"
          sx={{
            position: 'sticky', top: 0, zIndex: theme.zIndex.appBar, bgcolor: 'rgba(247,248,251,.96)',
            borderBottom: `1px solid ${tokens.color.line}`, backdropFilter: 'saturate(150%) blur(10px)',
            pt: { xs: 'env(safe-area-inset-top)', md: 0 },
          }}
        >
          <Toolbar sx={{ minHeight: { xs: activeWorkoutHeader ? 54 : 62, md: 76 }, px: { xs: 2, md: 4 } }}>
            {isMobile && <BrandMark compact={!activeWorkoutHeader} />}
            {!activeWorkoutHeader && <Typography component="h1" variant="h5" sx={{ ml: isMobile ? 1.5 : 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {pageName}
            </Typography>}
            {activeWorkoutHeader && <Box sx={{ flex: 1 }} />}
            {accountButton}
          </Toolbar>
          {activeWorkoutHeader && (
            <Box sx={{ px: 2, pb: 1.25 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography component="h1" variant="h5" noWrap sx={{ flex: 1 }}>{pageName}</Typography>
                <IconButton aria-label="Voltar" onClick={() => navigate(-1)} sx={{ width: 36, height: 36, minWidth: 36, minHeight: 36 }}><ArrowBack fontSize="small" /></IconButton>
              </Stack>
              <Box aria-hidden="true" sx={{ mt: 1, height: 3, bgcolor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ width: '42%', height: '100%', bgcolor: 'primary.main' }} />
              </Box>
            </Box>
          )}
          {loading && <LinearProgress aria-label="Carregando dados" />}
        </Box>

        {!online && (
          <Alert severity="warning" variant="filled" sx={{ borderRadius: 0 }}>
            Você está sem conexão. Consulte o que já está na tela; ações e novos dados voltam quando a internet retornar.
          </Alert>
        )}

        <Box component="main" id="main-content" tabIndex={-1}>
          {fullBleed ? children : (
            <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 }, px: { xs: 2, sm: 3, md: 4 } }}>
              {children}
            </Container>
          )}
        </Box>
      </Box>

      {isMobile && (
        <Box
          component="nav"
          aria-label="Navegação principal"
          sx={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: theme.zIndex.appBar,
            bgcolor: branding.footerColor, color: footerTextColor, borderTop: `1px solid ${alpha(footerTextColor, 0.2)}`,
            pb: 'env(safe-area-inset-bottom)', minHeight: 'var(--app-bottom-nav)',
            display: 'grid', gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))`,
          }}
        >
          {navItems.map((item) => {
            const active = pathIsActive(location.pathname, item.path);
            return (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                color={active ? 'primary' : 'inherit'}
                sx={{
                  minWidth: 0, minHeight: 76, borderRadius: 0, flexDirection: 'column', gap: 0.25,
                  fontSize: 16, fontWeight: 800, lineHeight: 1.1, px: 0.5, color: footerTextColor,
                  bgcolor: active ? alpha(footerTextColor, 0.13) : 'transparent',
                  boxShadow: active ? `inset 0 3px 0 ${theme.palette.primary.main}` : 'none',
                  '&:hover': { bgcolor: alpha(footerTextColor, active ? 0.17 : 0.08) },
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Button>
            );
          })}
        </Box>
      )}

      <Menu id="account-menu" anchorEl={accountAnchor} open={Boolean(accountAnchor)} onClose={() => setAccountAnchor(null)}>
        <MenuItem component={Link} to="/profile" onClick={() => setAccountAnchor(null)}>
          <ListItemIcon><PersonOutline /></ListItemIcon>Perfil
        </MenuItem>
        {!isStandalone && (canInstall || isIOS) && (
          <MenuItem onClick={openInstall}>
            <ListItemIcon><AddToHomeScreenOutlined /></ListItemIcon>Instalar aplicativo
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={logout}>
          <ListItemIcon><LogoutOutlined /></ListItemIcon>Sair
        </MenuItem>
      </Menu>

      <Dialog open={installOpen} onClose={() => setInstallOpen(false)} fullWidth maxWidth="xs" aria-labelledby="install-title">
        <DialogTitle id="install-title">Instalar {branding.appName}</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography>Abra seus treinos mais rápido e use o shell do aplicativo mesmo quando a conexão cair.</Typography>
            {isIOS && !canInstall && (
              <Alert severity="info">
                No Safari, toque em <strong>Compartilhar</strong> e depois em <strong>Adicionar à Tela de Início</strong>.
              </Alert>
            )}
            {!online && <Alert severity="warning">Conecte-se à internet para concluir a instalação.</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { dismissInstall(); setInstallOpen(false); }}>Agora não</Button>
          {canInstall && <Button variant="contained" disabled={!online} onClick={handleInstall}>Instalar</Button>}
          {isIOS && !canInstall && <Button variant="contained" onClick={() => setInstallOpen(false)}>Entendi</Button>}
        </DialogActions>
      </Dialog>

      <MySnackbar />
    </Box>
  );
}
