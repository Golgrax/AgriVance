import { useState, useMemo } from 'react';
import { Paper, Box, Typography, Stack } from '@mui/material';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { type Shipment } from '../types';

import ShipmentList from '../components/ShipmentList';
import AddShipmentForm from '../components/AddShipmentForm';

import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';

const ChangeView = ({ center, zoom }: { center: LatLngExpression; zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const SupplyChainPage = () => {
  const [shipmentsSnapshot] = useCollection(
    query(collection(db, 'shipments'), orderBy('createdAt', 'desc'))
  );
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const shipments = useMemo(() => {
    return shipmentsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shipment)) || [];
  }, [shipmentsSnapshot]);

  const handleSelectShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
  };

  const mapCenter: LatLngExpression = selectedShipment 
    ? [selectedShipment.currentLocation.lat, selectedShipment.currentLocation.lng] 
    : [34.05, -118.25];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Supply Chain Management
      </Typography>

      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        spacing={3}
      >
        {/* Left Column */}
        <Box sx={{ width: '100%', md: { width: '33.33%' } }}>
          <Stack spacing={2}>
            <AddShipmentForm />
            <Paper elevation={2}>
              <ShipmentList shipments={shipments} onSelectShipment={handleSelectShipment} />
            </Paper>
          </Stack>
        </Box>
        
        {/* Right Column */}
        <Box sx={{ width: '100%', md: { width: '66.67%' } }}>
          <Paper elevation={2} sx={{ height: '75vh', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
            <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {selectedShipment && (
                <>
                  <Marker position={[selectedShipment.currentLocation.lat, selectedShipment.currentLocation.lng]} />
                  <Marker position={[selectedShipment.origin.lat, selectedShipment.origin.lng]} opacity={0.6} />
                  {/* THIS IS THE CORRECTED LINE */}
                  <Marker position={[selectedShipment.destination.lat, selectedShipment.destination.lng]} opacity={0.6} />
                  <Polyline 
                    positions={[
                      [selectedShipment.origin.lat, selectedShipment.origin.lng],
                      [selectedShipment.destination.lat, selectedShipment.destination.lng]
                    ]} 
                    color="gray"
                    dashArray="5, 10"
                  />
                  <ChangeView center={mapCenter} zoom={11} />
                </>
              )}
            </MapContainer>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export default SupplyChainPage;