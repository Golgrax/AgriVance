import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';

interface FarmMapProps {
  lat: number;
  lng: number;
}
const ChangeView = ({ center, zoom }: { center: LatLngExpression; zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}
const FarmMap = ({ lat, lng }: FarmMapProps) => {
  const position: LatLngExpression = [lat, lng];
  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer center={position} zoom={10} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position}></Marker>
        <ChangeView center={position} zoom={10} />
      </MapContainer>
    </div>
  );
};
export default FarmMap;