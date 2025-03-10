import React, { useState, useEffect } from 'react';
import { FormControlLabel, Grid, Switch, TextField } from '@mui/material';
import dayjs, { Dayjs } from "dayjs";
import { User } from '../../domain/types';
import DateInput from '../DateInput';
import Modal from '../Modal';

interface UserFormProps {
  user?: User | null;
  isOpen: boolean;
  onSubmit: (user: User) => void;
  handleClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, isOpen, onSubmit, handleClose }) => {
  const [selectedDate] = useState<Dayjs>(dayjs());
  const clearFormData = {
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    birthdate: selectedDate?.format("YYYY-MM-DD"),
    weight: 0,
    height: 0,
    monthly_value_brl: 0,
    blocked: false
  }
  const [formData, setFormData] = useState<User>(clearFormData);

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData(clearFormData)
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeBirthdate = (value: string) => {
    setFormData((prev) => ({ ...prev, birthdate: value }));
  }

  const handleChangeCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = !e.target.checked
    setFormData(prev => ({ ...prev, blocked: value }));
  };

  return (
    <Modal
      open={isOpen}
      title='Cadastro de alunos'
      handleClose={handleClose}
      handleSubmit={() => onSubmit(formData)}
    >
      <Grid container spacing={1}>
        <Grid item xs={12} md={12}>
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
        </Grid>
        <Grid item xs={12} md={12}>
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
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            required={user?.id ? false: true}
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
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            required={user?.id ? false: true}
            margin="dense"
            id="confirm_password"
            name="confirm_password"
            label="Repetir senha"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.confirm_password}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            required
            margin="dense"
            id="phone"
            name="phone"
            label="Celular"
            fullWidth
            variant="outlined"
            value={formData.phone}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DateInput
            id="birthdate"
            name="birthdate"
            label="Data de nascimento"
            value={formData.birthdate}
            onChange={handleChangeBirthdate}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            required
            margin="dense"
            id="weight"
            name="weight"
            label="Peso (kg)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.weight}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            required
            margin="dense"
            id="height"
            name="height"
            label="Altura (cm)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.height}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            required
            margin="dense"
            id="monthly_value_brl"
            name="monthly_value_brl"
            label="Mensalidade (R$)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.monthly_value_brl}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
          <FormControlLabel control={<Switch checked={!formData.blocked} onChange={handleChangeCheckbox} />} label="Permitir acesso" />
        </Grid>
      </Grid>
    </Modal>
  );
};

export default UserForm;
