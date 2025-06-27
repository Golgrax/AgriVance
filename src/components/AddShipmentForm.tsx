import { useState } from 'react';
import { Paper, Typography, TextField, Button, Stack } from '@mui/material';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const locations = {
  "Farm A": { lat: 34.05, lng: -118.25 },
  "Factory X": { lat: 34.15, lng: -118.35 },
  "Warehouse Z": { lat: 33.95, lng: -118.15 },
};

const AddShipmentForm = () => {
  const [shipmentId, setShipmentId] = useState('');

  const handleAddShipment = async () => {
    if (!shipmentId) return;

    await addDoc(collection(db, 'shipments'), {
      shipmentId: shipmentId,
      origin: { name: "Farm A", ...locations["Farm A"] },
      destination: { name: "Factory X", ...locations["Factory X"] },
      currentLocation: locations["Farm A"],
      status: 'Pending',
      createdAt: serverTimestamp(),
    });
    setShipmentId('');
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6">Create New Shipment</Typography>
      <Stack direction="row" spacing={2} mt={2}>
        <TextField
          label="Shipment ID (e.g., SH-002)"
          value={shipmentId}
          onChange={(e) => setShipmentId(e.target.value)}
          size="small"
        />
        <Button onClick={handleAddShipment} variant="contained">Add</Button>
      </Stack>
    </Paper>
  );
};

export default AddShipmentForm;