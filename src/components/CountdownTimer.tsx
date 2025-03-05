import { useState, useEffect } from "react";
import { Button, Typography, Box, CircularProgress } from "@mui/material";

interface CountdownTimerProps {
  rest: number; // Tempo de descanso em segundos
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ rest }) => {
  const [time, setTime] = useState(rest);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    setTime(rest); // Atualiza o tempo ao mudar o `rest`
    setProgress(100);
  }, [rest]);

  useEffect(() => {
    if (!isRunning || time <= 0) return;

    const timer = setInterval(() => {
      setTime((prevTime) => {
        const newTime = prevTime - 1;
        setProgress((newTime / rest) * 100); // Atualiza a barra de progresso
        if (newTime <= 0) {
          setIsRunning(false);
          clearInterval(timer);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, rest]);

  const handleStartPause = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(rest);
    setProgress(100);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Typography color="info" variant="h6">Tempo de Descanso</Typography>
      <Box position="relative" display="inline-flex">
        <CircularProgress variant="determinate" value={progress} size={180} thickness={4} />
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h6">
            {Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}
          </Typography>
        </Box>
      </Box>

      <Box display="flex" gap={2}>
        <Button color="primary" onClick={handleStartPause}>
          {isRunning ? "Pausar" : "Iniciar"}
        </Button>
        <Button color="secondary" onClick={handleReset}>
          Resetar
        </Button>
      </Box>
    </Box>
  );
};

export default CountdownTimer;
