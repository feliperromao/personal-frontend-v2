import React, { useState } from "react";
import { Box, Typography, Modal, TextField, Button, Grid, Card } from "@mui/material";
import dayjs from "dayjs";
import Template from "../../components/Template";

interface Event {
  id: number;
  date: string;
  time: string;
  title: string;
}

const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
const daysOfWeek = Array.from({ length: 7 }, (_, i) => dayjs().startOf("week").add(i, "day"));

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");

  const handleDoubleClick = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    const existingEvent = events.find(event => event.date === date && event.time === time);
    setEventTitle(existingEvent ? existingEvent.title : "");
    setModalOpen(true);
  };

  const handleSaveEvent = () => {
    if (!selectedDate || !selectedTime) return;
    setEvents(prev => {
      const filteredEvents = prev.filter(event => !(event.date === selectedDate && event.time === selectedTime));
      return [...filteredEvents, { id: Date.now(), date: selectedDate, time: selectedTime, title: eventTitle }];
    });
    setModalOpen(false);
    setEventTitle("");
  };

  return (
    <Template pageName='Dashboard' >
      <Card>
        <Box sx={{ width: "100%", margin: "auto", textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Agenda Semanal
          </Typography>
          <Grid container>
            <Grid item xs={1}></Grid>
            {daysOfWeek.map(day => (
              <Grid item xs={1.5} key={day.format("YYYY-MM-DD")}>
                <Typography variant="subtitle2">{day.format("ddd DD")}</Typography>
              </Grid>
            ))}
            {hours.map(hour => (
              <React.Fragment key={hour}>
                <Grid item xs={1}>
                  <Typography variant="caption">{hour}</Typography>
                </Grid>
                {daysOfWeek.map(day => {
                  const date = day.format("YYYY-MM-DD");
                  const event = events.find(e => e.date === date && e.time === hour);
                  return (
                    <Grid item xs={1.5} key={`${date}-${hour}`} sx={{ borderTop: "1px solid #eee" }}>
                      <Box
                        onDoubleClick={() => handleDoubleClick(date, hour)}
                        sx={{
                          borderLeft: "1px solid #ccc",
                          borderRight: "1px solid #ccc",
                          minHeight: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          backgroundColor: event ? "#d3f9d8" : "white",
                        }}
                      >
                        {event && (
                          <Typography variant="caption" sx={{ color: "green" }}>
                            {event.title}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  );
                })}
              </React.Fragment>
            ))}
          </Grid>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 300, bgcolor: "white", p: 3, borderRadius: 2 }}>
              <Typography variant="h6">{selectedDate} {selectedTime}</Typography>
              <TextField fullWidth label="Título do evento" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} margin="normal" />
              <Button variant="contained" fullWidth onClick={handleSaveEvent}>Salvar</Button>
            </Box>
          </Modal>
        </Box>
      </Card>
    </Template>
  );
};

export default Calendar;
