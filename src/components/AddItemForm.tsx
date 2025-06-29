import { useState, useMemo } from 'react';
import { Box, TextField, Button, Stack, MenuItem, Autocomplete } from '@mui/material';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '../firebase';

interface LocationOption { id: string; label: string; }

const AddItemForm = () => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [location, setLocation] = useState<LocationOption | null>(null);

  const [locationsSnapshot] = useCollection(collection(db, 'locations'));
  const locationOptions: LocationOption[] = useMemo(() => 
    locationsSnapshot?.docs.map(doc => ({ id: doc.id, label: doc.data().name })) || [],
    [locationsSnapshot]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !location) {
      alert('Please fill out all fields, including the location.');
      return;
    }
    await addDoc(collection(db, 'inventory'), {
      name, name_lowercase: name.toLowerCase(),
      quantity: Number(quantity), unit, location: location.label,
      lastUpdated: serverTimestamp(),
    });
    setName(''); setQuantity(''); setUnit('kg'); setLocation(null);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField label="Item Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <TextField label="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        <TextField select label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} sx={{minWidth: 100}}>
          <MenuItem value="kg">kg</MenuItem> <MenuItem value="bags">bags</MenuItem>
          <MenuItem value="liters">liters</MenuItem> <MenuItem value="units">units</MenuItem>
        </TextField>
        <Autocomplete sx={{ width: 250 }} options={locationOptions} value={location}
          onChange={(_, newValue) => setLocation(newValue)}
          renderInput={(params) => <TextField {...params} label="Location" required />}
        />
        <Button type="submit" variant="contained">Add Item</Button>
      </Stack>
    </Box>
  );
};

export default AddItemForm;