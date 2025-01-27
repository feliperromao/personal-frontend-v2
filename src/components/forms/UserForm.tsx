// UserForm.tsx
import React, { useState, useEffect } from 'react';
import { User } from '../../domain/types';
import { Backdrop, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

interface UserFormProps {
  user?: User | null;
  isOpen: boolean;
  onSubmit: (user: User) => void;
  handleClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, isOpen, onSubmit, handleClose }) => {
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

      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          onSubmit(formData);
          // setFormData({ name: '', email: '', password: '' });
          // handleClose();
        },
      }}
    >
      <DialogTitle>Cadastro de usuarios</DialogTitle>
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
        <Button onClick={handleClose}>Cancelar</Button>
        <Button type="submit">{user ? 'Editar' : 'Criar'} Usuário</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm;
