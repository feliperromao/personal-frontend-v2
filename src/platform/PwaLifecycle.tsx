import { Alert, Button, Snackbar } from '@mui/material';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function PwaLifecycle() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true });

  return (
    <>
      <Snackbar open={needRefresh} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert
          severity="info"
          action={<Button color="inherit" onClick={() => updateServiceWorker(true)}>Atualizar</Button>}
          onClose={() => setNeedRefresh(false)}
        >
          Nova versão disponível. Atualize quando puder interromper o que está fazendo.
        </Alert>
      </Snackbar>
      <Snackbar open={offlineReady} autoHideDuration={5000} onClose={() => setOfflineReady(false)} message="Aplicativo pronto para abrir sem conexão." />
    </>
  );
}
