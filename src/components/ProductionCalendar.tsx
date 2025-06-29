import { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { type ProductionTask } from '../types';
import { Modal, Box, Typography, TextField, Button, Stack, MenuItem, Paper, Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 3,
  borderRadius: 2,
};

const ProductionCalendar = () => {
  const [tasksSnapshot] = useCollection(collection(db, 'productionTasks'));
  const [modalOpen, setModalOpen] = useState(false);
  
  // State to manage whether we are adding a new event or editing an existing one
  const [editingEvent, setEditingEvent] = useState<ProductionTask | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [taskDetails, setTaskDetails] = useState({
    title: '',
    category: 'Planting' as ProductionTask['category'],
  });

  // Convert Firestore docs to FullCalendar events
  const events = useMemo(() => {
    return tasksSnapshot?.docs.map(doc => {
      const data = doc.data() as ProductionTask;
      return {
        id: doc.id,
        title: data.title,
        date: data.date,
        color: data.category === 'Planting' ? '#4caf50' : 
               data.category === 'Harvesting' ? '#ff9800' :
               data.category === 'Maintenance' ? '#f44336' : '#2196f3',
        extendedProps: data, // Store the original data
      };
    }) || [];
  }, [tasksSnapshot]);

  // Handle clicking on a blank date to add a new event
  const handleDateClick = (arg: { dateStr: string }) => {
    setSelectedDate(arg.dateStr);
    setEditingEvent(null); // Ensure we're in "add new" mode
    setTaskDetails({ title: '', category: 'Planting' });
    setModalOpen(true);
  };

  // Handle clicking on an existing event to edit it
  const handleEventClick = (clickInfo: any) => {
    const eventData = clickInfo.event.extendedProps as ProductionTask;
    setEditingEvent({ ...eventData, id: clickInfo.event.id });
    setTaskDetails({ title: eventData.title, category: eventData.category });
    setSelectedDate(clickInfo.event.startStr);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingEvent(null);
  };

  const handleSaveChanges = async () => {
    if (editingEvent && editingEvent.id) {
      // Update existing event
      const eventRef = doc(db, 'productionTasks', editingEvent.id);
      await updateDoc(eventRef, { ...taskDetails });
    } else {
      // Add new event
      await addDoc(collection(db, 'productionTasks'), {
        ...taskDetails,
        date: selectedDate,
        status: 'To Do',
      });
    }
    handleCloseModal();
  };

  const handleDeleteEvent = async () => {
    if (editingEvent && editingEvent.id && window.confirm("Are you sure you want to delete this task?")) {
      const eventRef = doc(db, 'productionTasks', editingEvent.id);
      await deleteDoc(eventRef);
      handleCloseModal();
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick} // <-- This is the new prop!
        height="75vh"
        editable // Allows dragging and dropping (a free bonus feature!)
      />

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {editingEvent ? 'Edit Task' : `New Task for ${selectedDate}`}
            </Typography>
            <IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={2}>
            <TextField
              label="Task Title"
              value={taskDetails.title}
              onChange={(e) => setTaskDetails({ ...taskDetails, title: e.target.value })}
              fullWidth
            />
            <TextField select label="Category" value={taskDetails.category}
              onChange={(e) => setTaskDetails({ ...taskDetails, category: e.target.value as ProductionTask['category'] })}
            >
              <MenuItem value="Planting">Planting</MenuItem>
              <MenuItem value="Harvesting">Harvesting</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Logistics">Logistics</MenuItem>
            </TextField>
            <Stack direction="row" justifyContent="space-between">
              {editingEvent && (
                <Button variant="outlined" color="error" onClick={handleDeleteEvent}>
                  Delete Task
                </Button>
              )}
              <Button variant="contained" onClick={handleSaveChanges}>
                {editingEvent ? 'Save Changes' : 'Add Task'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </Paper>
  );
};

export default ProductionCalendar;