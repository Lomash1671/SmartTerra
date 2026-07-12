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
        const state = get();
        const edit = state.edits[editId];
        if (!edit) return;

        const user = state.currentUser;
        const stateChanging = !!(update.state && update.state !== edit.state);

        // Build all new audit log entries inline so they can be committed in the
        // SAME atomic set() call as the edits/networkCache changes.
        // Previously, logAction() fired its own set({auditLogs}) BEFORE the outer
        // set({edits, networkCache}). Because Zustand v5 uses useSyncExternalStore
        // (which bypasses React batching), each set() triggered a synchronous
        // re-render. Components saw intermediate renders where edit.state was still
        // 'Pending Approval', and in some React 19 scheduling paths the final
        // set() render was discarded as a tearing-prevention measure — so the UI
        // never reflected the approved state.
        const newLogEntries: AuditLog[] = [];
        const makeLog = (action: string, description: string): AuditLog => ({
          id: uuidv4(),
          userId: user ? user.id : 'SYSTEM',
          timestamp: new Date().toISOString(),
          action,
          description,
          editId,
        });

        if (stateChanging) {
          if (customLog) {
            newLogEntries.push(makeLog(customLog.action, customLog.description));
          } else {
            newLogEntries.push(makeLog('STATE_CHANGE', `State changed to ${update.state}`));
          }
        }

        // Compute new networkCache (only when approving)
        let newNetworkCache = state.networkCache;
        if (update.state === 'Approved') {
          newNetworkCache = { ...state.networkCache };
          if (edit.after && edit.after.id) {
            newNetworkCache[edit.after.id] = edit.after;
          } else if (edit.elementId && edit.after === null) {
            delete newNetworkCache[edit.elementId];
          }
          newLogEntries.push(makeLog('PUBLISH_EDIT', 'Edit changes applied to published network.'));
        }

        // Single atomic set — all slices (networkCache, edits, auditLogs) update
        // together so React sees exactly ONE consistent state transition.
        set({
          networkCache: newNetworkCache,
          auditLogs: [...newLogEntries, ...state.auditLogs],
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
      name: 'water-network-storage',
      version: 2, // Bumped to wipe stale localStorage — clears all old edits/logs
    }
  )
);
