import { useState, useMemo } from 'react';
// UPDATED: Import all necessary MUI components
import { Paper, Box, Typography, Stack, Select, MenuItem, FormControl, InputLabel, Divider, List, ListItem, ListItemText } from '@mui/material';
import { useCollection } from 'react-firebase-hooks/firestore';
// UPDATED: Import all necessary Firestore functions
import { collection, doc, getDocs, query, where, writeBatch, orderBy, serverTimestamp } from 'firebase/firestore';
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
  if (!selectedShipment?.id || !selectedShipment.contents) return;

  if (selectedShipment.status === 'Delivered') {
    alert("This shipment has already been delivered and its inventory processed. No further changes can be made.");
    return;
  }
  
  if (selectedShipment.status === 'In Transit' && newStatus === 'Pending') {
    alert("Cannot revert a shipment that is already in transit back to pending.");
    return;
  }

  setIsUpdating(true);
  
  try {
    const batch = writeBatch(db);
    const shipmentRef = doc(db, 'shipments', selectedShipment.id);
    batch.update(shipmentRef, { status: newStatus });

    // --- LOGIC FOR DEDUCTING FROM ORIGIN ---
    if (newStatus === 'In Transit') {
      for (const item of selectedShipment.contents) {
        const q = query(
          collection(db, "inventory"), 
          where("name_lowercase", "==", item.itemName.toLowerCase()),
          where("location", "==", selectedShipment.origin.name)
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const inventoryDoc = snapshot.docs[0];
          const currentQuantity = inventoryDoc.data().quantity;
          const newQuantity = currentQuantity - item.quantity;
          
          if (newQuantity < 0) {
            throw new Error(`Not enough ${item.itemName} at ${selectedShipment.origin.name} to ship. Operation cancelled.`);
          }
          batch.update(inventoryDoc.ref, { quantity: newQuantity });
        } else {
          throw new Error(`Cannot find ${item.itemName} at ${selectedShipment.origin.name}. Operation cancelled.`);
        }
      }
    }
    // --- LOGIC FOR ADDING TO DESTINATION ---
    else if (newStatus === 'Delivered') {
      for (const item of selectedShipment.contents) {
        const q = query(
          collection(db, "inventory"), 
          where("name_lowercase", "==", item.itemName.toLowerCase()),
          where("location", "==", selectedShipment.destination.name)
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const inventoryDoc = snapshot.docs[0];
          const newQuantity = inventoryDoc.data().quantity + item.quantity;
          batch.update(inventoryDoc.ref, { quantity: newQuantity });
        } else {
          const newInventoryRef = doc(collection(db, "inventory"));
          batch.set(newInventoryRef, {
            name: item.itemName, name_lowercase: item.itemName.toLowerCase(),
            quantity: item.quantity, unit: item.unit,
            location: selectedShipment.destination.name, lastUpdated: serverTimestamp(),
          });
        }
      }
    }
    
    await batch.commit();
    setSelectedShipment(prev => prev ? { ...prev, status: newStatus } : null);
    
  } catch (error: any) {
    console.error("Error updating shipment and inventory: ", error);
    alert(`Operation failed: ${error.message}`); // Show the specific error to the user
  }
  
  setIsUpdating(false);
};

  const mapCenter: LatLngExpression = selectedShipment 
    ? [selectedShipment.currentLocation.lat, selectedShipment.currentLocation.lng] 
    : [34.05, -118.25];

  return (
    <Stack spacing={3}>
      <Typography variant="h4" gutterBottom>Supply Chain & Logistics</Typography>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        
        {/* Left Column */}
        <Box sx={{ width: '100%', lg: { width: '25%' } }}>
          <Stack spacing={3}>
            <Paper elevation={3} sx={{p: 2}}><AddLocationForm /></Paper>
            <Paper elevation={3} sx={{p: 2}}><AddShipmentForm /></Paper>
          </Stack>
        </Box>

        {/* Middle Column */}
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
        
        {/* Right Column */}
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
                
                {/* NEW: Display shipment contents */}
                <Typography variant="subtitle1" sx={{ mt: 1 }}>Contents:</Typography>
                <Paper variant="outlined" sx={{ p: 1, my: 1 }}>
                  <List dense>
                    {selectedShipment.contents?.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={item.itemName} secondary={`${item.quantity} ${item.unit}`} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>

                <Box sx={{ flexGrow: 1, borderRadius: '8px', overflow: 'hidden', mt: 2 }}>
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