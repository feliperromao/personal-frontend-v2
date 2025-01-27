import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Exercises from './pages/Exercises';
import { GlobalStateProvider } from './GlobalState';
import Trainings from './pages/Trainings';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <GlobalStateProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/students" element={<ProtectedRoute element={<Students />} />} />
          <Route path="/exercises" element={<ProtectedRoute element={<Exercises />} />} />
          <Route path="/trainings" element={<ProtectedRoute element={<Trainings />} />} />
        </Routes>
      </Router>
    </GlobalStateProvider>
  </React.StrictMode>
);
