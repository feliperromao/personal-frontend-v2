import React from 'react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
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
import Calendar from './pages/Calendar/Calendar';
import Profile from './pages/Profile';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <GlobalStateProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute allowedType="PERSONAL" element={<Dashboard />} />} />
        <Route path="/students" element={<ProtectedRoute allowedType="PERSONAL" element={<Students />} />} />
        <Route path="/exercises" element={<ProtectedRoute allowedType="PERSONAL" element={<Exercises />} />} />
        <Route path="/trainings" element={<ProtectedRoute allowedType="PERSONAL" element={<Trainings />} />} />
        <Route path="/calendar" element={<ProtectedRoute allowedType="PERSONAL" element={<Calendar />} />} />
        <Route path="/my-workouts" element={<ProtectedRoute allowedType="STUDENT" element={<StudentWorkouts />} />} />
        <Route path="/profile" element={<ProtectedRoute allowedType="ALL" element={<Profile />} />} />
      </Routes>
    </Router>
  </GlobalStateProvider>
);
