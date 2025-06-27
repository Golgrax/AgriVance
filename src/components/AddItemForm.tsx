import { useState } from 'react';
import { Box, TextField, Button, Stack, MenuItem } from '@mui/material';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const AddItemForm = () => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [location, setLocation] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !location) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      await addDoc(collection(db, 'inventory'), {
        name: name,
        name_lowercase: name.toLowerCase(),
        quantity: Number(quantity),
        unit: unit,
        location: location,
        lastUpdated: serverTimestamp(),
      });
      setName('');
      setQuantity('');
      setUnit('kg');
      setLocation('');
    } catch (error) {
      console.error("Error adding document: ", error);
      alert('Failed to add item.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
      <Stack direction="row" spacing={2}>
        <TextField label="Item Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <TextField label="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        <TextField select label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} sx={{minWidth: 100}}>
            <MenuItem value="kg">kg</MenuItem>
            <MenuItem value="bags">bags</MenuItem>
            <MenuItem value="liters">liters</MenuItem>
            <MenuItem value="units">units</MenuItem>
        </TextField>
        <TextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
        <Button type="submit" variant="contained">Add Item</Button>
      </Stack>
    </Box>
  );
};

export default AddItemForm;