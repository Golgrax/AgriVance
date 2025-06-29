import { Box } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, type Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { InventoryItem } from '../types';

const columns: GridColDef<InventoryItem>[] = [
  { field: 'name', headerName: 'Item Name', width: 200 },
  { field: 'quantity', headerName: 'Quantity', type: 'number', width: 120 },
  { field: 'unit', headerName: 'Unit', width: 120 },
  { field: 'location', headerName: 'Location', width: 180 },
  {
    field: 'lastUpdated',
    headerName: 'Last Updated',
    width: 200,
    valueGetter: (value: Timestamp) => {
      return value ? value.toDate().toLocaleString() : 'N/A';
    },
  },
];

const InventoryTable = () => {
  const [value, loading, error] = useCollection(collection(db, 'inventory'));

  const rows: InventoryItem[] = value?.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      quantity: data.quantity,
      unit: data.unit,
      location: data.location,
      lastUpdated: data.lastUpdated, 
    };
  }) || [];

  if (error) {
    return <strong>Error: {JSON.stringify(error)}</strong>;
  }

  return (
    <Box sx={{ height: 450, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10, 20]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default InventoryTable;