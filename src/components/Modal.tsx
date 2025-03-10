import * as React from 'react';
import { Save, Close } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery } from '@mui/material';

interface ModalProps {
  title: string;
  open: boolean;
  children: React.ReactNode;
  handleClose: () => void;
  handleSubmit: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, open, children, handleClose, handleSubmit }) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={isMobile}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          handleSubmit();
        },
      }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>{title}</DialogTitle>
      <DialogContent sx={{ paddingTop: '20px!important' }}>{children}</DialogContent>
      <DialogActions>
        <Button startIcon={<Close />} onClick={handleClose}>Cancelar</Button>
        <Button startIcon={<Save />} variant="contained" type="submit">Salvar</Button>
      </DialogActions>
    </Dialog>
  )
}

export default Modal;