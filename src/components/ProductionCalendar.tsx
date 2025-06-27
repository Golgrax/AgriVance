import { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { type ProductionTask } from '../types';
import { Modal, Box, Typography, TextField, Button, Stack, MenuItem, Paper } from '@mui/material';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const ProductionCalendar = () => {
  const [tasksSnapshot] = useCollection(collection(db, 'productionTasks'));
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'Planting' as ProductionTask['category'],
  });

  const events = useMemo(() => {
    return tasksSnapshot?.docs.map(doc => {
      const data = doc.data() as ProductionTask;
      return {
        id: doc.id,
        title: data.title,
        date: data.date,
        // Add color based on category!
        color: data.category === 'Planting' ? '#4caf50' : 
               data.category === 'Harvesting' ? '#ff9800' :
               data.category === 'Maintenance' ? '#f44336' : '#2196f3',
      };
    }) || [];
  }, [tasksSnapshot]);

  const handleDateClick = (arg: { dateStr: string }) => {
    setSelectedDate(arg.dateStr);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setNewTask({ title: '', category: 'Planting' });
  };

  const handleAddTask = async () => {
    if (!newTask.title || !selectedDate) return;
    
    await addDoc(collection(db, 'productionTasks'), {
      title: newTask.title,
      date: selectedDate,
      category: newTask.category,
      status: 'To Do',
    });
    
    handleCloseModal();
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
        events={events}
        dateClick={handleDateClick}
        height="75vh"
      />

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={style}>
          <Typography variant="h6">Add New Task for {selectedDate}</Typography>
          <Stack spacing={2} mt={2}>
            <TextField
              label="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              fullWidth
            />
            <TextField
              select
              label="Category"
              value={newTask.category}
              onChange={(e) => setNewTask({ ...newTask, category: e.target.value as ProductionTask['category'] })}
            >
              <MenuItem value="Planting">Planting</MenuItem>
              <MenuItem value="Harvesting">Harvesting</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Logistics">Logistics</MenuItem>
            </TextField>
            <Button variant="contained" onClick={handleAddTask}>Add Task</Button>
          </Stack>
        </Box>
      </Modal>
    </Paper>
  );
};

export default ProductionCalendar;