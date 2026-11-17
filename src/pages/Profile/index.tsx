import { AddToHomeScreenOutlined, LogoutOutlined, MailOutline, PersonOutline, PhoneOutlined } from '@mui/icons-material';
import { Alert, Box, Button, Divider, List, ListItem, ListItemIcon, ListItemText, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Template from '../../components/Template';
import { User } from '../../domain/types';
import { usePwa } from '../../platform/PwaContext';
import { tokens } from '../../theme';

export default function Profile() {
  const navigate = useNavigate();
  const { canInstall, isIOS, isStandalone, online, promptInstall } = usePwa();
  let user: Partial<User> = {};
  try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch { user = {}; }

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth-token');
    navigate('/login', { replace: true });
  };

  return (
    <Template pageName="Perfil" type={user.type}>
      <Stack spacing={3} sx={{ maxWidth: 720 }}>
        <Box>
          <Typography variant="h2" component="h2">Sua conta</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Dados usados para identificar seu acesso ao MyPersonal.App.</Typography>
        </Box>
        <Paper sx={{ border: `1px solid ${tokens.color.line}` }}>
          <List disablePadding>
            <ListItem sx={{ py: 2.5 }}>
              <ListItemIcon><PersonOutline /></ListItemIcon>
              <ListItemText primary="Nome" secondary={user.name || 'Não informado'} />
            </ListItem>
            <Divider component="li" />
            <ListItem sx={{ py: 2.5 }}>
              <ListItemIcon><MailOutline /></ListItemIcon>
              <ListItemText primary="E-mail" secondary={user.email || 'Não informado'} />
            </ListItem>
            {user.phone && <><Divider component="li" /><ListItem sx={{ py: 2.5 }}><ListItemIcon><PhoneOutlined /></ListItemIcon><ListItemText primary="Celular" secondary={user.phone} /></ListItem></>}
          </List>
        </Paper>

        {!isStandalone && (canInstall || isIOS) && (
          <Paper sx={{ p: 3, border: `1px solid ${tokens.color.line}` }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
              <Box>
                <Typography variant="h5">Instale o aplicativo</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>Abra seus treinos pela tela inicial e tenha o shell pronto em quedas de conexão.</Typography>
              </Box>
              {canInstall ? (
                <Button startIcon={<AddToHomeScreenOutlined />} variant="contained" disabled={!online} onClick={() => promptInstall()}>Instalar</Button>
              ) : (
                <Alert severity="info" sx={{ maxWidth: 320 }}>No Safari: Compartilhar → Adicionar à Tela de Início.</Alert>
              )}
            </Stack>
          </Paper>
        )}

        <Box>
          <Button color="error" variant="outlined" startIcon={<LogoutOutlined />} onClick={logout}>Sair da conta</Button>
        </Box>
      </Stack>
    </Template>
  );
}
