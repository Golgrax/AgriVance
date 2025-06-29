import { useState } from 'react';
import { Paper, Typography, TextField, Button, Stack, Autocomplete } from '@mui/material';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '../firebase';

interface LocationOption {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

const AddShipmentForm = () => {
  const [shipmentId, setShipmentId] = useState('');
  const [origin, setOrigin] = useState<LocationOption | null>(null);
  const [destination, setDestination] = useState<LocationOption | null>(null);

  const [locationsSnapshot] = useCollection(collection(db, 'locations'));
  const locationOptions: LocationOption[] = locationsSnapshot?.docs.map(doc => ({
    id: doc.id,
    label: doc.data().name,
    ...doc.data()
  } as LocationOption)) || [];

  const handleAddShipment = async () => {
    if (!shipmentId || !origin || !destination) {
      alert("Please fill all fields.");
      return;
    }

    await addDoc(collection(db, 'shipments'), {
      shipmentId: shipmentId,
      origin: { name: origin.label, lat: origin.lat, lng: origin.lng },
      destination: { name: destination.label, lat: destination.lat, lng: destination.lng },
      currentLocation: { lat: origin.lat, lng: origin.lng },
      status: 'Pending',
      createdAt: serverTimestamp(),
    });
    setShipmentId('');
    setOrigin(null);
    setDestination(null);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Create New Shipment</Typography>
      <Stack spacing={2} mt={2}>
        <TextField
          label="Shipment ID (e.g., SH-003)"
          value={shipmentId}
          onChange={(e) => setShipmentId(e.target.value)}
        />
        <Autocomplete
          options={locationOptions}
          value={origin}
          onChange={(_event, newValue) => setOrigin(newValue)}
          renderInput={(params) => <TextField {...params} label="Origin" />}
        />
        <Autocomplete
          options={locationOptions}
          value={destination}
          onChange={(_event, newValue) => setDestination(newValue)}
          renderInput={(params) => <TextField {...params} label="Destination" />}
        />
        <Button onClick={handleAddShipment} variant="contained">Add Shipment</Button>
      </Stack>
    </Paper>
  );
};

export default AddShipmentForm;
