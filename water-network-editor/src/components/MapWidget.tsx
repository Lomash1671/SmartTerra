import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import { Box, Button, ButtonGroup, Typography, Paper } from '@mui/material';
import { useAppStore } from '../store/useAppStore';
import { NetworkElement } from '../types';
import L from 'leaflet';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

interface MapWidgetProps {
  onElementSelect: (elem: NetworkElement) => void;
}

type DrawMode = 'none' | 'Point' | 'LineString';

const MapEvents = ({ drawMode, onMapClick }: { drawMode: DrawMode, onMapClick: (latlng: L.LatLng) => void }) => {
  useMapEvents({
    click(e) {
      if (drawMode !== 'none') {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
};

const MapWidget = ({ onElementSelect }: MapWidgetProps) => {
  const { networkCache, edits, currentUser, createEdit } = useAppStore();
  const [drawMode, setDrawMode] = useState<DrawMode>('none');
  const [lineStart, setLineStart] = useState<L.LatLng | null>(null);

  // Merge network cache with active edits
  const displayElements = useMemo(() => {
    const elements = { ...networkCache };
    Object.values(edits).forEach(edit => {
      // Only apply to display if it's draft (own) or pending
      if (edit.state === 'Approved' || edit.state === 'Rejected') return;
      if (edit.after === null && edit.elementId) {
        delete elements[edit.elementId]; // deleted
      } else if (edit.after) {
        elements[edit.after.id] = edit.after;
      }
    });
    return Object.values(elements);
  }, [networkCache, edits]);

  const handleMapClick = (latlng: L.LatLng) => {
    if (drawMode === 'none') return;

    if (drawMode === 'Point') {
      const newJunction: NetworkElement = {
        id: `J-${Date.now()}`,
        type: 'Junction',
        coordinates: [latlng.lat, latlng.lng],
        properties: {}
      };
      createEdit({
        state: 'Draft',
        elementId: newJunction.id,
        before: null,
        after: newJunction
      });
      setDrawMode('none');
    } else if (drawMode === 'LineString') {
      if (!lineStart) {
        setLineStart(latlng);
      } else {
        const newPipe: NetworkElement = {
          id: `P-${Date.now()}`,
          type: 'Pipe',
          coordinates: [
            [lineStart.lat, lineStart.lng],
            [latlng.lat, latlng.lng]
          ],
          properties: {}
        };
        createEdit({
          state: 'Draft',
          elementId: newPipe.id,
          before: null,
          after: newPipe
        });
        setLineStart(null);
        setDrawMode('none');
      }
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {currentUser?.role === 'Editor' && (
        <Paper sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, p: 1, display: 'flex', gap: 1 }}>
          <ButtonGroup variant="contained" size="small">
            <Button 
              color={drawMode === 'Point' ? 'secondary' : 'primary'}
              onClick={() => { setDrawMode(drawMode === 'Point' ? 'none' : 'Point'); setLineStart(null); }}
            >
              + Junction
            </Button>
            <Button 
              color={drawMode === 'LineString' ? 'secondary' : 'primary'}
              onClick={() => { setDrawMode(drawMode === 'LineString' ? 'none' : 'LineString'); setLineStart(null); }}
            >
              + Pipe {lineStart ? '(Click end)' : ''}
            </Button>
          </ButtonGroup>
        </Paper>
      )}

      <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents drawMode={drawMode} onMapClick={handleMapClick} />

        {displayElements.map((elem) => {
          if (elem.type === 'Pipe' || elem.coordinates.length > 2) {
            return (
              <Polyline 
                key={elem.id} 
                positions={elem.coordinates as [number, number][]} 
                color="blue" 
                weight={elem.properties?.diameter > 100 ? 5 : 3}
                eventHandlers={{ click: () => onElementSelect(elem) }}
              />
            );
          } else {
            return (
              <Marker 
                key={elem.id} 
                position={elem.coordinates as [number, number]}
                eventHandlers={{ click: () => onElementSelect(elem) }}
              >
                <Popup>
                  <Typography variant="subtitle2">{elem.type} - {elem.id}</Typography>
                </Popup>
              </Marker>
            );
          }
        })}
        
        {lineStart && (
          <Marker position={[lineStart.lat, lineStart.lng]} opacity={0.5} />
        )}
      </MapContainer>
    </Box>
  );
};

export default MapWidget;
