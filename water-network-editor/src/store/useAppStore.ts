import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { User, NetworkElement, Edit, AuditLog, GeoJSONFeature, Comment } from '../types';
import initialData from '../data/initialNetwork.json';

// Note: GeoJSON uses [lng, lat], but React Leaflet expects [lat, lng].
// We will store as [lat, lng] in our NetworkElement store for simplicity.
const parseInitialData = (): Record<string, NetworkElement> => {
  const elements: Record<string, NetworkElement> = {};
  (initialData.features as GeoJSONFeature[]).forEach((f) => {
    let coords = f.geometry.coordinates;
    if (f.geometry.type === 'Point') {
      const ptCoords = coords as number[];
      coords = [ptCoords[1], ptCoords[0]]; // lng, lat -> lat, lng
    } else if (f.geometry.type === 'LineString') {
      const lineCoords = coords as number[][];
      coords = lineCoords.map(c => [c[1], c[0]]);
    }
    const { id, type, ...props } = f.properties;
    elements[id] = {
      id,
      type,
      coordinates: coords,
      properties: props
    };
  });
  return elements;
};

export const USERS: User[] = [
  { id: '1', name: 'Alice', role: 'Admin' },
  { id: '2', name: 'Bob', role: 'Editor' },
  { id: '3', name: 'Charlie', role: 'Operator' }
];

interface AppState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  networkCache: Record<string, NetworkElement>; // Published state
  setNetworkCache: (network: Record<string, NetworkElement>) => void;
  
  edits: Record<string, Edit>;
  createEdit: (editData: Partial<Edit>) => void;
  updateEdit: (editId: string, update: Partial<Edit>, customLog?: { action: string; description: string }) => void;
  
  addComment: (editId: string, text: string) => void;
  
  auditLogs: AuditLog[];
  logAction: (action: string, description: string, editId?: string) => void;
  
  resetState: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      
      networkCache: parseInitialData(),
      setNetworkCache: (network) => set({ networkCache: network }),
      
      edits: {},
      createEdit: (editData) => {
        const id = uuidv4();
        const user = get().currentUser;
        if (!user) return;
        const newEdit: Edit = {
          id,
          state: editData.state || 'Draft',
          comments: [],
          createdBy: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...editData
        };
        set((state) => ({
          edits: { ...state.edits, [id]: newEdit }
        }));
        get().logAction('CREATE_EDIT', `Created edit for ${editData.elementId || 'new element'}`, id);
      },
      updateEdit: (editId, update, customLog) => {
        // Use get() to read current state so we can compute the full next state
        // atomically in a single set() call. Previously, calling set() inside
        // set() caused the outer return to overwrite the networkCache changes.
        const state = get();
        const edit = state.edits[editId];
        if (!edit) return;

        const stateChanging = !!(update.state && update.state !== edit.state);

        if (stateChanging) {
          if (customLog) {
            state.logAction(customLog.action, customLog.description, editId);
          } else {
            state.logAction('STATE_CHANGE', `State changed to ${update.state}`, editId);
          }
        }

        // Compute new networkCache atomically (only when approving)
        let newNetworkCache = state.networkCache;
        if (update.state === 'Approved') {
          newNetworkCache = { ...state.networkCache };
          if (edit.after && edit.after.id) {
            newNetworkCache[edit.after.id] = edit.after;
          } else if (edit.elementId && edit.after === null) {
            delete newNetworkCache[edit.elementId];
          }
          state.logAction('PUBLISH_EDIT', 'Edit changes applied to published network.', editId);
        }

        // Single atomic set — no nested set() calls
        set({
          networkCache: newNetworkCache,
          edits: {
            ...state.edits,
            [editId]: {
              ...edit,
              ...update,
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },
      
      addComment: (editId, text) => {
        const user = get().currentUser;
        if (!user) return;
        const comment: Comment = {
          id: uuidv4(),
          userId: user.id,
          timestamp: new Date().toISOString(),
          text
        };
        set((state) => {
          const edit = state.edits[editId];
          if (!edit) return state;
          return {
            edits: {
              ...state.edits,
              [editId]: {
                ...edit,
                comments: [...edit.comments, comment],
                updatedAt: new Date().toISOString()
              }
            }
          };
        });
      },
      
      auditLogs: [],
      logAction: (action, description, editId) => {
        const user = get().currentUser;
        const log: AuditLog = {
          id: uuidv4(),
          userId: user ? user.id : 'SYSTEM',
          timestamp: new Date().toISOString(),
          action,
          description,
          editId
        };
        set((state) => ({
          auditLogs: [log, ...state.auditLogs]
        }));
      },
      
      resetState: () => {
        set({
          currentUser: null,
          networkCache: parseInitialData(),
          edits: {},
          auditLogs: []
        });
      }
    }),
    {
      name: 'water-network-storage'
    }
  )
);
