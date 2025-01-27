import React, { useState } from 'react';
import { TextField, Button, Container, Typography, CircularProgress, ContainerProps } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login: React.FC<ContainerProps> = ({ children }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successful, setSuccessful] = useState(false)
  const URL = `${process.env.REACT_APP_BACKEND_GRAPH_API}/auth/login`

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(URL, {
        email,
        password
      }).then(({data}) => {
        const { user, access_token } = data
        if (user.type === "PERSONAL") {
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('auth-token', access_token);
          navigate("/")
        }
      })
    } catch (e) {
      console.error('Login error:', e);
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4" component="h1" gutterBottom>
        Entrar como Personal
      </Typography>
      <form onSubmit={handleLogin}>
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
          label="Password"
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
          disabled={loading}
          style={{ marginTop: '16px' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Login'}
        </Button>
      </form>
      {error && <Typography color="error">{error}</Typography>}
      {successful && <Typography color="primary">Login successful!</Typography>}
    </Container>
  );
};

export default Login;
