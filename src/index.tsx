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
import StudentWorkouts from './pages/StudentWorkouts';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <GlobalStateProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute allowedType="PERSONAL" element={<Dashboard />} />} />
          <Route path="/students" element={<ProtectedRoute allowedType="PERSONAL" element={<Students />} />} />
          <Route path="/exercises" element={<ProtectedRoute allowedType="PERSONAL" element={<Exercises />} />} />
          <Route path="/trainings" element={<ProtectedRoute allowedType="PERSONAL" element={<Trainings />} />} />
          <Route path="/my-workouts" element={<ProtectedRoute allowedType="STUDENT" element={<StudentWorkouts />} />} />
        </Routes>
      </Router>
    </GlobalStateProvider>
  </React.StrictMode>
);
