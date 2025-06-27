import { Typography, Divider } from '@mui/material';
import AddItemForm from '../components/AddItemForm';
import InventoryTable from '../components/InventoryTable';

const InventoryPage = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Inventory Management
      </Typography>
      <Typography paragraph>
        Add new items to your inventory. The table below will update in real-time.
      </Typography>
      
      <AddItemForm />

      <Divider sx={{ my: 2 }} />

      <InventoryTable />
    </div>
  );
};

export default InventoryPage;