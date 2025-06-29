import { Typography, Box, Divider } from '@mui/material';
import AddItemForm from '../components/AddItemForm';
import InventoryTable from '../components/InventoryTable';

const InventoryPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Inventory Management
      </Typography>
      <Typography paragraph>
        Add, edit, or delete items from your inventory. All changes are reflected in real-time.
      </Typography>
      <AddItemForm />
      <Divider sx={{ my: 2 }} />
      <InventoryTable />
    </Box>
  );
};

export default InventoryPage;