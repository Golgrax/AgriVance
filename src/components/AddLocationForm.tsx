import { useState } from 'react';
// THE FIX: 'Box' has been removed from this import line.
import { Typography, TextField, Button, Stack, MenuItem, CircularProgress } from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import axios from 'axios';

const OWM_API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0/direct';

const AddLocationForm = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Farm');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingCoords, setLoadingCoords] = useState(false);

  const findCoordinates = async () => {
    if (!address) return;
    setLoadingCoords(true);
    try {
      const response = await axios.get(GEO_API_URL, {
        params: { q: address, limit: 1, appid: OWM_API_KEY },
      });
      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setCoords({ lat, lng: lon });
      } else {
        alert('Could not find coordinates for this address.');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to fetch coordinates.');
    }
    setLoadingCoords(false);
  };

  const handleAddLocation = async () => {
    if (!name || !type || !coords) {
      alert('Please fill all fields and find coordinates.');
      return;
    }
    await addDoc(collection(db, 'locations'), { name, type, ...coords });
    setName('');
    setType('Farm');
    setAddress('');
    setCoords(null);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Add New Location</Typography>
      <TextField label="Location Name (e.g., Main Farm)" value={name} onChange={(e) => setName(e.target.value)} />
      <TextField select label="Location Type" value={type} onChange={(e) => setType(e.target.value)}>
        <MenuItem value="Farm">Farm</MenuItem>
        <MenuItem value="Factory">Factory</MenuItem>
        <MenuItem value="Warehouse">Warehouse</MenuItem>
      </TextField>
      <TextField label="Full Address (for coordinates)" value={address} onChange={(e) => setAddress(e.target.value)} />
      <Button onClick={findCoordinates} disabled={loadingCoords} variant="outlined">
        {loadingCoords ? <CircularProgress size={24} /> : "Find Coordinates"}
      </Button>
      {coords && <Typography>Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}</Typography>}
      <Button onClick={handleAddLocation} variant="contained" disabled={!coords}>Add Location</Button>
    </Stack>
  );
};

export default AddLocationForm;