import { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import PwaLifecycle from './platform/PwaLifecycle';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const Exercises = lazy(() => import('./pages/Exercises'));
const Trainings = lazy(() => import('./pages/Trainings'));
const StudentWorkouts = lazy(() => import('./pages/StudentWorkouts'));
const StudentWorkoutDetails = lazy(() => import('./pages/StudentWorkouts/StudentWorkoutDetails'));
const ActiveExercise = lazy(() => import('./pages/StudentWorkouts/ActiveExercise'));
const Profile = lazy(() => import('./pages/Profile'));
const EvolutionReport = lazy(() => import('./pages/Reports/EvolutionReport'));

function RouteLoading() {
  return (
    <Box role="status" aria-label="Carregando página" sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
      <CircularProgress size={36} />
    </Box>
  );
}

export default function App() {
  return (
    <>
      <PwaLifecycle />
      <Suspense fallback={<RouteLoading />}>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute allowedType="PERSONAL" element={<Dashboard />} />} />
        <Route path="/students" element={<ProtectedRoute allowedType="PERSONAL" element={<Students />} />} />
        <Route path="/exercises" element={<ProtectedRoute allowedType="PERSONAL" element={<Exercises />} />} />
        <Route path="/trainings" element={<ProtectedRoute allowedType="PERSONAL" element={<Trainings />} />} />
        <Route path="/trainings/:trainingId/run" element={<ProtectedRoute allowedType="PERSONAL" element={<StudentWorkoutDetails mode="PERSONAL" />} />} />
        <Route path="/trainings/:trainingId/run/exercises/:exerciseId" element={<ProtectedRoute allowedType="PERSONAL" element={<ActiveExercise mode="PERSONAL" />} />} />
        <Route path="/reports/evolution" element={<ProtectedRoute allowedType="PERSONAL" element={<EvolutionReport mode="PERSONAL" />} />} />
        <Route path="/calendar" element={<Navigate to="/" replace />} />
        <Route path="/my-workouts" element={<ProtectedRoute allowedType="STUDENT" element={<StudentWorkouts />} />} />
        <Route path="/my-workouts/:trainingId" element={<ProtectedRoute allowedType="STUDENT" element={<StudentWorkoutDetails mode="STUDENT" />} />} />
        <Route path="/my-workouts/:trainingId/exercises/:exerciseId" element={<ProtectedRoute allowedType="STUDENT" element={<ActiveExercise mode="STUDENT" />} />} />
        <Route path="/my-evolution" element={<ProtectedRoute allowedType="STUDENT" element={<EvolutionReport mode="STUDENT" />} />} />
        <Route path="/profile" element={<ProtectedRoute allowedType="ALL" element={<Profile />} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
