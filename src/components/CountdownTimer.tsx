import { useState, useEffect } from "react";
import { Button, TextField, Typography, Box, CircularProgress } from "@mui/material";

interface CountdownTimerProps {
  rest: number
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ rest }) => {
  const [time, setTime] = useState(rest);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(100);
  const initialTime = 60;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && time > 0) {
      timer = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime - 1;
          setProgress((newTime / initialTime) * 100);
          return newTime;
        });
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, time]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(initialTime);
    setProgress(100);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Box position="relative" display="inline-flex">
        <CircularProgress variant="determinate" value={progress} size={100} thickness={4} />
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

      <TextField
        label="Definir Tempo (s)"
        type="number"
        variant="outlined"
        value={time}
        onChange={(e) => setTime(Number(e.target.value))}
        disabled={isRunning}
      />

      <Box display="flex" gap={2}>
        <Button variant="contained" color="primary" onClick={handleStartPause}>
          {isRunning ? "Pausar" : "Iniciar"}
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleReset}>
          Resetar
        </Button>
      </Box>
    </Box>
  );
};

export default CountdownTimer;
