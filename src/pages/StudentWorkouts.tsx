import React from 'react';
import { Grid } from '@mui/material';
import Template from '../components/Template';
import Breadcrumb from '../components/Breadcrumb';
import TrainingCard from '../components/TrainingCard';
import { Training } from '../domain/types';
import api from './@shared/api';
import { handleOpenNotification, SNACKBAR_TYPES } from '../components/MySnackbar';
import { useGlobalState } from '../GlobalState';
import StartWorkoutDialog from '../components/StartWorkoutDialog';

const StudentWorkouts: React.FC = () => {
  const { setLoading } = useGlobalState();
  const [trainings, setTrainings] = React.useState<Training[]>([]);
  const [openTraining, setOpenTraining] = React.useState(false);
  const [showTraining, setShowTraining] = React.useState<Training|undefined>(undefined);

  React.useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/training-progress`);
      setTrainings(response.data);
    } catch (error) {
      handleOpenNotification("Falha ao listar os treinos", SNACKBAR_TYPES.error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTraining = (training: Training) => {
    setShowTraining(training)
    setOpenTraining(true)
  }

  const handleCloseTraining = () => {
    setShowTraining(undefined)
    setOpenTraining(false)
  }

  return (
    <Template type="STUDENT" pageName='Meus Treinos'>
      <>
        <Breadcrumb uri='trainings' title='Treinos' />
        <Grid mt={1} container spacing={2}>
          {trainings && trainings.map(training => (
            <Grid item xs={12} md={6} key={training.id}>
              <TrainingCard handleOpen={handleOpenTraining} training={training} />
            </Grid>

          ))}
        </Grid>
      </>
      <StartWorkoutDialog open={openTraining} training={showTraining} handleClose={handleCloseTraining} />
    </Template>
  );
};

export default StudentWorkouts;
