import React, { useState } from "react";
import { MenuItem, Select, InputLabel, FormControl, SelectChangeEvent } from "@mui/material";

type ExerciseCategory = {
  name: string;
  type: string;
};

const exerciseCategories: ExerciseCategory[] = [
  { name: "CHEST", type: "Peito" },
  { name: "BACK", type: "Costas" },
  { name: "LEGS", type: "Pernas" },
  { name: "SHOULDERS", type: "Ombros" },
  { name: "BICEPS", type: "Biceps" },
  { name: "TRICEPS", type: "Triceps" },
  { name: "ABS", type: "Abdomem" },
  { name: "GLUTES", type: "Gluteos" },
  { name: "CALVES", type: "Panturrilhas" },
  { name: "CARDIO", type: "Cardio" },
  { name: "MOBILITY", type: "Mobilidade" }
];

interface ExerciseType {
  value: string
  onChange: (type: string) => void
}

const ExerciseType: React.FC<ExerciseType> = ({value, onChange}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(value);

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value as string);
    onChange(event.target.value)
  };

  return (
    <FormControl fullWidth margin="dense">
      <InputLabel id="exercise-select-label">Categoria</InputLabel>
      <Select
        labelId="exercise-select-label"
        value={selectedCategory}
        onChange={(e) => handleChange(e)}
        label="Categoria"
      >
        {exerciseCategories.map((category) => (
          <MenuItem key={category.name} value={category.name}>
            {category.type}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
export default ExerciseType;