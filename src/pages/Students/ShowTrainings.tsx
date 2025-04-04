import React from 'react'
import Modal from '../../components/Modal';
import { Training, User } from '../../domain/types';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Paper from '@mui/material/Paper';
import api from '../@shared/api';

function createData(
  name: string,
  description: string,
  total_exercises: number,
  total_executions: number,
) {
  return { name, description, total_exercises, total_executions };
}


interface ShowTrainingsProps {
  open: boolean;
  student?: User;
  handleClose: () => void;
}

const ShowTrainings: React.FC<ShowTrainingsProps> = ({ open, student, handleClose }) => {
  const [trainings, setTrainings] = React.useState<Training[]>([]);

  React.useEffect(() => {
    if (open) {
      fetchUserTrainings();
    }
  }, [open]);

  const fetchUserTrainings = async () => {
    const response = await api.get(`/trainings/student/${student?.id}`);
    setTrainings(response.data);
  }

  return (
    <Modal
      open={open}
      title={`Treinos de ${student?.name}`}
      handleClose={handleClose}
      handleSubmit={() => { }}
    >
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 550 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell >Descrição</TableCell>
              <TableCell align="right">Exercicios</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trainings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Nenhum treino encontrado para este aluno.
                </TableCell>
              </TableRow>
            ) : (
              trainings.map((row) => (
                <TableRow
                  key={row.name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">{row.name}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell align="right">{row.exercises.length}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Modal>
  )
}

export default ShowTrainings;