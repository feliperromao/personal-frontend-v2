// UserForm.tsx
import React, { useState, useEffect } from 'react';
import { User } from '../../domain/types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, useMediaQuery } from '@mui/material';

interface UserFormProps {
  user?: User | null;
  isOpen: boolean;
  onSubmit: (user: User) => void;
  handleClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, isOpen, onSubmit, handleClose }) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [formData, setFormData] = useState<User>({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullScreen={isMobile}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          onSubmit(formData);
        },
      }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        Cadastro de Alunos
      </DialogTitle>
      <DialogContent>
        <TextField
          required
          margin="dense"
          id="name"
          name="name"
          label="Nome"
          fullWidth
          variant="outlined"
          value={formData.name}
          onChange={handleChange}
        />
        <TextField
          required
          margin="dense"
          id="email"
          name="email"
          label="E-mail"
          type="email"
          fullWidth
          variant="outlined"
          value={formData.email}
          onChange={handleChange}
        />
        <TextField
          required
          margin="dense"
          id="password"
          name="password"
          label="Senha"
          type="password"
          fullWidth
          variant="outlined"
          value={formData.password}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button color='inherit' onClick={handleClose}>Cancelar</Button>
        <Button variant='contained' type="submit">{user ? 'Editar' : 'Criar'} Aluno</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm;
