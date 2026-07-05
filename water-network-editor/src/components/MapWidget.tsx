import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, useMapEvents, CircleMarker } from 'react-leaflet';
import { Box, Button, ButtonGroup, Typography, Paper } from '@mui/material';
import { useAppStore } from '../store/useAppStore';
import { NetworkElement } from '../types';
import L from 'leaflet';

// Fix Leaflet default icon paths
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

// Colour per element type for quick visual recognition
const ELEMENT_COLORS: Record<string, string> = {
  Junction: '#0ea5e9',   // sky blue
  Valve: '#f97316',      // orange
  Reservoir: '#0d9488',  // teal
};

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

  // Track which element IDs come from active (non-published) edits for visual cue
  const draftElementIds = useMemo(() => {
    const ids = new Set<string>();
    Object.values(edits).forEach(edit => {
      if (edit.state === 'Approved' || edit.state === 'Rejected') return;
      if (edit.after?.id) ids.add(edit.after.id);
    });
    return ids;
  }, [edits]);

  // Merge published network with active draft/pending edits for display
  const displayElements = useMemo(() => {
    const elements = { ...networkCache };
    Object.values(edits).forEach(edit => {
      if (edit.state === 'Approved' || edit.state === 'Rejected') return;
      if (edit.after === null && edit.elementId) {
        delete elements[edit.elementId];
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
        properties: { elevation: 100, demand: 0 }
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
          properties: {
            diameter: 150,
            roughness: 130,
            status: 'open',
            length: Math.round(
              Math.sqrt(
                Math.pow((latlng.lat - lineStart.lat) * 111000, 2) +
                Math.pow((latlng.lng - lineStart.lng) * 111000 * Math.cos(latlng.lat * Math.PI / 180), 2)
              )
            )
          }
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

      {/* Legend */}
      <Paper sx={{ position: 'absolute', bottom: 30, left: 10, zIndex: 1000, p: 1, fontSize: 11 }}>
        <Typography variant="caption" display="block" fontWeight="bold" mb={0.5}>Legend</Typography>
        {Object.entries(ELEMENT_COLORS).map(([type, color]) => (
          <Box key={type} display="flex" alignItems="center" gap={1} mb={0.3}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color, border: '1px solid #fff', boxShadow: 1 }} />
            <Typography variant="caption">{type}</Typography>
          </Box>
        ))}
        <Box display="flex" alignItems="center" gap={1} mb={0.3}>
          <Box sx={{ width: 16, height: 3, bgcolor: '#2563eb' }} />
          <Typography variant="caption">Pipe (published)</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ width: 16, height: 3, bgcolor: '#f97316', borderTop: '2px dashed #f97316' }} />
          <Typography variant="caption">Pipe (draft/pending)</Typography>
        </Box>
      </Paper>

      <MapContainer center={[51.505, -0.09]} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents drawMode={drawMode} onMapClick={handleMapClick} />

        {displayElements.map((elem) => {
          const isDraft = draftElementIds.has(elem.id);

          if (elem.type === 'Pipe') {
            return (
              <Polyline
                key={elem.id}
                positions={elem.coordinates as [number, number][]}
                pathOptions={{
                  color: isDraft ? '#f97316' : '#2563eb',
                  weight: (elem.properties?.diameter ?? 0) > 150 ? 5 : 3,
                  dashArray: isDraft ? '8 5' : undefined,
                  opacity: isDraft ? 0.85 : 1,
                }}
                eventHandlers={{ click: () => onElementSelect(elem) }}
              />
            );
          }

          // Point elements — colour-coded CircleMarkers
          const color = ELEMENT_COLORS[elem.type] ?? '#94a3b8';
          return (
            <CircleMarker
              key={elem.id}
              center={elem.coordinates as [number, number]}
              radius={isDraft ? 9 : 7}
              pathOptions={{
                color: isDraft ? '#f97316' : color,
                fillColor: color,
                fillOpacity: 0.85,
                weight: isDraft ? 2.5 : 1.5,
                dashArray: isDraft ? '4 3' : undefined,
              }}
              eventHandlers={{ click: () => onElementSelect(elem) }}
            >
              <Popup>
                <Typography variant="subtitle2">{elem.type} — {elem.id}</Typography>
                {isDraft && (
                  <Typography variant="caption" color="warning.dark">🔶 Draft / Pending</Typography>
                )}
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Ghost marker while drawing a pipe */}
        {lineStart && (
          <CircleMarker
            center={[lineStart.lat, lineStart.lng]}
            radius={6}
            pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.6, dashArray: '4 3' }}
          />
        )}
      </MapContainer>
    </Box>
  );
};

export default MapWidget;
