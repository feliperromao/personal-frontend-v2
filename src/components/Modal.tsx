import * as React from 'react';
import { Save, Close } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery } from '@mui/material';

interface ModalProps {
  title: string;
  open: boolean;
  children: React.ReactNode;
  handleClose: () => void;
  handleSubmit: () => void;
  submitting?: boolean;
}

const Modal: React.FC<ModalProps> = ({ title, open, children, handleClose, handleSubmit, submitting = false }) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  return (
    <Dialog
      open={open}
      onClose={(_, reason) => { if (!submitting && reason !== 'backdropClick') handleClose(); }}
      fullScreen={isMobile}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.stopPropagation();
          event.preventDefault();
          handleSubmit();
        },
      }}
    >
      <DialogTitle sx={{ position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1, borderBottom: 1, borderColor: 'divider' }}>{title}</DialogTitle>
      <DialogContent sx={{ paddingTop: '20px!important' }}>{children}</DialogContent>
      <DialogActions sx={{ position: 'sticky', bottom: 0, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', p: 2 }}>
        <Button type="button" startIcon={<Close />} onClick={handleClose} disabled={submitting}>Cancelar</Button>
        <Button startIcon={<Save />} variant="contained" type="submit" disabled={submitting}>{submitting ? 'Salvando…' : 'Salvar'}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default Modal;
