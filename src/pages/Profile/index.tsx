import { useEffect, useState } from "react";
import { Box, Typography, TextField, Button, Container, Paper } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Template from "../../components/Template";
import { User } from "../../domain/types";

interface ProfileForm {
  name: string;
  email: string;
  password?: string;
  phone?: string;
}

const schema = yup.object().shape({
  name: yup.string().required("Nome é obrigatório"),
  email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
  password: yup.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  phone: yup.string().matches(/^\d{10,11}$/, "Número de telefone inválido"),
});

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const [success, setSuccess] = useState(false);

  const onSubmit = (data: ProfileForm) => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      const userData: User = JSON.parse(userRaw);
      setUser(userData);
      reset({...userData, password: ""});
    }
  }, [reset]);

  return (
    <Template pageName="Perfil">
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Dados Pessoais
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Controller
                disabled
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Nome" fullWidth error={!!errors.name} helperText={errors.name?.message} />
                )}
              />
              <Controller
                disabled
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="E-mail" fullWidth error={!!errors.email} helperText={errors.email?.message} />
                )}
              />
              <Controller
                disabled
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Senha" type="password" fullWidth error={!!errors.password} helperText={errors.password?.message} />
                )}
              />
              <Controller
                disabled
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Telefone" fullWidth error={!!errors.phone} helperText={errors.phone?.message} />
                )}
              />
              <Button disabled type="submit" variant="contained" color="primary">
                Atualizar
              </Button>
            </Box>
          </form>
          {success && <Typography color="success.main">Dados atualizados com sucesso!</Typography>}
        </Paper>
      </Container>
    </Template>
  );
};

export default Profile;
