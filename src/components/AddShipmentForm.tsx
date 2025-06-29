import { useState, useMemo } from 'react';
import { Paper, Typography, TextField, Button, Stack, Autocomplete, IconButton, Divider } from '@mui/material';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '../firebase';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface LocationOption {
  id: string;
  label: string;
  lat: number;
  lng: number;
}
interface InventoryOption {
  id: string;
  label: string;
  unit: string;
}
interface ShipmentContent {
  itemName: string;
  quantity: number;
  unit: string;
}

const AddShipmentForm = () => {
  const [shipmentId, setShipmentId] = useState('');
  const [origin, setOrigin] = useState<LocationOption | null>(null);
  const [destination, setDestination] = useState<LocationOption | null>(null);
  const [contents, setContents] = useState<ShipmentContent[]>([]);
  const [currentItem, setCurrentItem] = useState<InventoryOption | null>(null);
  const [currentQty, setCurrentQty] = useState('');
  const [locationsSnapshot] = useCollection(collection(db, 'locations'));
  const [inventorySnapshot] = useCollection(collection(db, 'inventory'));

  const locationOptions: LocationOption[] = useMemo(() => 
    locationsSnapshot?.docs.map(doc => ({
      id: doc.id,
      label: doc.data().name,
      ...doc.data()
    } as LocationOption)) || [],
    [locationsSnapshot]
  );
  
  const inventoryOptions: InventoryOption[] = useMemo(() => {
    const items = inventorySnapshot?.docs.map(doc => ({
      id: doc.id,
      label: doc.data().name,
      unit: doc.data().unit
    })) || [];
    const uniqueLabels = new Set(items.map(item => item.label));
    return Array.from(uniqueLabels).map(label => items.find(item => item.label === label)!);
  }, [inventorySnapshot]);

  const addContentItem = () => {
    if (!currentItem || !currentQty || Number(currentQty) <= 0) return;
    setContents([
      ...contents,
      { itemName: currentItem.label, quantity: Number(currentQty), unit: currentItem.unit }
    ]);
    setCurrentItem(null);
    setCurrentQty('');
  };

  const removeContentItem = (indexToRemove: number) => {
    setContents(contents.filter((_, index) => index !== indexToRemove));
  };

  const handleCreateShipment = async () => {
    if (!shipmentId || !origin || !destination || contents.length === 0) {
      alert("Please fill all fields and add at least one item to the shipment.");
      return;
    }

    try {
      await addDoc(collection(db, 'shipments'), {
        shipmentId,
        origin: { name: origin.label, lat: origin.lat, lng: origin.lng },
        destination: { name: destination.label, lat: destination.lat, lng: destination.lng },
        contents,
        currentLocation: { lat: origin.lat, lng: origin.lng },
        status: 'Pending',
        createdAt: serverTimestamp(),
      });
      setShipmentId('');
      setOrigin(null);
      setDestination(null);
      setContents([]);
    } catch (error) {
      console.error("Error creating shipment: ", error);
      alert("Failed to create shipment.");
    }
  };

  return (
    <Paper elevation={3} sx={{p: 2}}>
      <Typography variant="h6" gutterBottom>Create New Shipment</Typography>
      <Stack spacing={2} mt={2}>
        <TextField
          label="Shipment ID"
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
        
        <Divider>Contents</Divider>
        
        <Stack spacing={1}>
          {contents.map((item, index) => (
            <Paper key={index} variant="outlined" sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">{item.quantity} {item.unit} of {item.itemName}</Typography>
              <IconButton size="small" onClick={() => removeContentItem(index)} aria-label="delete item">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Paper>
          ))}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Autocomplete
            sx={{ flexGrow: 1 }}
            options={inventoryOptions}
            value={currentItem}
            onChange={(_event, newValue) => setCurrentItem(newValue)}
            renderInput={(params) => <TextField {...params} label="Item" size="small" />}
          />
          <TextField
            sx={{ width: 100 }}
            label="Qty"
            type="number"
            size="small"
            value={currentQty}
            onChange={(e) => setCurrentQty(e.target.value)}
          />
          <Button variant="outlined" onClick={addContentItem} aria-label="add item">
            <AddIcon />
          </Button>
        </Stack>

        <Button onClick={handleCreateShipment} variant="contained" color="primary">
          Create Shipment
        </Button>
      </Stack>
    </Paper>
  );
};

export default AddShipmentForm;
