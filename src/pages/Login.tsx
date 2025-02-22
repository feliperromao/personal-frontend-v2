import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  CircularProgress,
  Paper,
  Box,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const URL = `${process.env.REACT_APP_BACKEND_API}/auth/login`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const { data } = await axios.post(URL, { email, password });

      const { user, access_token } = data;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("auth-token", access_token);
      setSuccess(true);
      const navigateTO = user.type == "PERSONAL" ? "/" : "/my-workouts"
      setTimeout(() => navigate(navigateTO), 1500);
    } catch (err) {
      setError("Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={6}
        sx={{
          mt: 8,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Entrar no MyPersonal.App
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">Login bem-sucedido!</Alert>}

        <Box component="form" onSubmit={handleLogin} sx={{ width: "100%", mt: 2 }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Senha"
            type="password"
            fullWidth
            margin="normal"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Entrar"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
