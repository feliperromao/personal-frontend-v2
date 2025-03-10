import { Button, Card, CardActions, CardContent, Typography } from "@mui/material"
import React from "react"
import { Training } from "../../domain/types"

interface TrainingCardProps {
  training: Training;
  handleOpen: (training: Training) => void;
}

const TrainingCard: React.FC<TrainingCardProps> = ({ training, handleOpen }) => {
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {training.name}
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>
        {training.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => handleOpen(training)}>ver treino</Button>
      </CardActions>
    </Card>
  )
}

export default TrainingCard;