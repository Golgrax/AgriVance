import { Timestamp } from 'firebase/firestore';

export interface InventoryItem {
  id?: string; // doc id
  name: string;
  quantity: number;
  unit: string; // yung kg, bags, liters
  location: string;
  lastUpdated: Timestamp;
}

export interface ProductionTask {
  id?: string;
  title: string;
  date: string;
  category: 'Planting' | 'Harvesting' | 'Maintenance' | 'Logistics';
  status: 'To Do' | 'In Progress' | 'Done';
}

export interface Shipment {
  id?: string;
  shipmentId: string; // e.g., "SH-001"
  origin: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
  contents: {
    itemName: string;
    quantity: number;
    unit: string;
  }[];
  currentLocation: { lat: number; lng: number };
  status: 'Pending' | 'In Transit' | 'Delivered';
  createdAt: any; // Firestore Timestamp
}