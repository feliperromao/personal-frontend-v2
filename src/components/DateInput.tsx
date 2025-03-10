import React, { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

interface DateInputProps {
  id: string;
  name: string;
  label: string;
  value: any;
  onChange: (value: string) => void;
}
const DateInput: React.FC<DateInputProps> = ({ name, label, value, onChange }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs(value));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        sx={{marginTop: '8px', marginBottom: '4px'}}
        format="DD/MM/YYYY"
        name={name}
        label={label}
        value={selectedDate}
        onChange={(newValue) => {
          if (newValue) {
            setSelectedDate(newValue)
            onChange(newValue.format("YYYY-MM-DD"))
          }
        }}
        slotProps={{
          textField: { fullWidth: true }
        }}
      />
    </LocalizationProvider>
  );
};

export default DateInput;
