import { useState, useMemo } from 'react';
import { Paper, Box, Typography, Stack, Select, MenuItem, FormControl, InputLabel, Divider } from '@mui/material';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, orderBy, query, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { type Shipment } from '../types';
import ShipmentList from '../components/ShipmentList';
import AddShipmentForm from '../components/AddShipmentForm';
import AddLocationForm from '../components/AddLocationForm';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';

const ChangeView = ({ center, zoom }: { center: LatLngExpression; zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const SupplyChainPage = () => {
  const [shipmentsSnapshot, loadingShipments] = useCollection(
    query(collection(db, 'shipments'), orderBy('createdAt', 'desc'))
  );
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const shipments = useMemo(() => {
    return shipmentsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shipment)) || [];
  }, [shipmentsSnapshot]);

  const handleSelectShipment = (shipment: Shipment) => setSelectedShipment(shipment);
  
  const handleStatusChange = async (newStatus: Shipment['status']) => {
    if (!selectedShipment?.id) return;
    setIsUpdating(true);
    const shipmentRef = doc(db, 'shipments', selectedShipment.id);
    await updateDoc(shipmentRef, { status: newStatus });
    setSelectedShipment(prev => prev ? { ...prev, status: newStatus } : null);
    setIsUpdating(false);
  };

  const mapCenter: LatLngExpression = selectedShipment 
    ? [selectedShipment.currentLocation.lat, selectedShipment.currentLocation.lng] 
    : [34.05, -118.25];

  return (
    <Stack spacing={3}>
      <Typography variant="h4" gutterBottom>Supply Chain & Logistics</Typography>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        <Box sx={{ width: '100%', lg: { width: '25%' } }}>
          <Stack spacing={3}>
            <Paper elevation={3} sx={{p: 2}}><AddLocationForm /></Paper>
            <Paper elevation={3} sx={{p: 2}}><AddShipmentForm /></Paper>
          </Stack>
        </Box>
        <Box sx={{ width: '100%', lg: { width: '25%' } }}>
          <Paper elevation={3} sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ p: 2 }}>All Shipments</Typography>
            <Divider />
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {loadingShipments ? <Typography sx={{p: 2}}>Loading...</Typography> : 
                <ShipmentList shipments={shipments} onSelectShipment={handleSelectShipment} />
              }
            </Box>
          </Paper>
        </Box>
        <Box sx={{ width: '100%', lg: { width: '50%' } }}>
          <Paper elevation={2} sx={{ p: 2, height: '80vh' }}>
            {selectedShipment ? (
              <Stack sx={{ height: '100%' }}>
                <Typography variant="h5">Tracking: {selectedShipment.shipmentId}</Typography>
                <FormControl fullWidth sx={{ my: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={selectedShipment.status} label="Status" onChange={(e) => handleStatusChange(e.target.value as Shipment['status'])} disabled={isUpdating}>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Transit">In Transit</MenuItem>
                    <MenuItem value="Delivered">Delivered</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ flexGrow: 1, borderRadius: '8px', overflow: 'hidden' }}>
                  <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[selectedShipment.currentLocation.lat, selectedShipment.currentLocation.lng]} />
                    <Polyline positions={[[selectedShipment.origin.lat, selectedShipment.origin.lng], [selectedShipment.destination.lat, selectedShipment.destination.lng]]} color="gray" dashArray="5, 10" />
                    <ChangeView center={mapCenter} zoom={11} />
                  </MapContainer>
                </Box>
              </Stack>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="h6" color="text.secondary">Select a shipment to see its route</Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Stack>
    </Stack>
  );
};

export default SupplyChainPage;
