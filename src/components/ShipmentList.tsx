import { List, ListItem, ListItemButton, ListItemText, ListItemIcon, Chip } from '@mui/material';
import { type Shipment } from '../types';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

interface ShipmentListProps {
  shipments: Shipment[];
  onSelectShipment: (shipment: Shipment) => void;
}

const ShipmentList = ({ shipments, onSelectShipment }: ShipmentListProps) => {
  const getStatusChip = (status: Shipment['status']) => {
    if (status === 'Delivered') return <Chip label="Delivered" color="success" size="small" icon={<CheckCircleIcon />} />;
    if (status === 'In Transit') return <Chip label="In Transit" color="info" size="small" icon={<LocalShippingIcon />} />;
    return <Chip label="Pending" color="warning" size="small" icon={<PendingIcon />} />;
  };

  return (
    <List>
      {shipments.map((shipment) => (
        <ListItem key={shipment.id} disablePadding secondaryAction={getStatusChip(shipment.status)}>
          <ListItemButton onClick={() => onSelectShipment(shipment)}>
            <ListItemIcon><LocalShippingIcon /></ListItemIcon>
            <ListItemText primary={shipment.shipmentId} secondary={`${shipment.origin.name} → ${shipment.destination.name}`} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default ShipmentList;