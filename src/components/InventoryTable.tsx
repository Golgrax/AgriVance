import { Box } from '@mui/material';
import { DataGrid, type GridColDef, GridActionsCellItem, type GridRowParams } from '@mui/x-data-grid';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, doc, updateDoc, deleteDoc, type Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { InventoryItem } from '../types';
import DeleteIcon from '@mui/icons-material/Delete';

const InventoryTable = () => {
  const [inventorySnapshot, loading, error] = useCollection(collection(db, 'inventory'));

  const processRowUpdate = async (newRow: InventoryItem, oldRow: InventoryItem) => {
    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) return oldRow;
    
    const itemRef = doc(db, 'inventory', newRow.id!);
    const { name, quantity, unit, location } = newRow;
    await updateDoc(itemRef, { name, name_lowercase: name.toLowerCase(), quantity, unit, location });
    return newRow;
  };

  const handleDeleteClick = (id: string) => async () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteDoc(doc(db, 'inventory', id));
    }
  };
  
  const columns: GridColDef<InventoryItem>[] = [
    { field: 'name', headerName: 'Item Name', width: 200, editable: true },
    { field: 'quantity', headerName: 'Quantity', type: 'number', width: 120, editable: true },
    { field: 'unit', headerName: 'Unit', width: 120, editable: true },
    { field: 'location', headerName: 'Location', width: 180, editable: true },
    { 
      field: 'lastUpdated', headerName: 'Last Updated', width: 200, type: 'dateTime',
      valueGetter: (value: Timestamp) => value ? value.toDate() : null,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }: GridRowParams) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={handleDeleteClick(id as string)}
          color="inherit"
        />,
      ],
    },
  ];

  const rows: InventoryItem[] = inventorySnapshot?.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<InventoryItem, 'id'>),
  })) || [];

  if (error) {
    return <strong>Error: {JSON.stringify(error)}</strong>;
  }

  return (
    <Box sx={{ height: 550, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        editMode="row"
        processRowUpdate={processRowUpdate}
      />
    </Box>
  );
};

export default InventoryTable;