export type Role = 'Admin' | 'Editor' | 'Operator';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export type NetworkElementType = 'Junction' | 'Pipe' | 'Valve' | 'Reservoir';

export interface NetworkElement {
  id: string;
  type: NetworkElementType;
  coordinates: number[] | number[][]; // [lat, lng] or [[lat, lng], [lat, lng]] for lines
  properties: Record<string, any>;
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point' | 'LineString';
    coordinates: number[] | number[][]; 
    // note: standard geojson is [lng, lat], let's try to stick to standard where possible, but leaflet uses [lat, lng]
  };
  properties: {
    id: string;
    type: NetworkElementType;
    [key: string]: any;
  };
}

export interface Comment {
  id: string;
  userId: string;
  timestamp: string;
  text: string;
}

export type EditState = 'Draft' | 'Assigned' | 'Pending Approval' | 'Approved' | 'Rejected';

export interface TaskSubmission {
  observedValue: string;
  condition: string;
  notes: string;
}

export interface Edit {
  id: string;
  state: EditState;
  elementId?: string; 
  // For new elements or modified elements
  before?: NetworkElement | null;
  after?: NetworkElement | null;
  
  assignedOperatorId?: string;
  taskSubmission?: TaskSubmission;
  rejectReason?: string;
  
  comments: Comment[];
  createdBy: string; // userId
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  timestamp: string;
  action: string;
  description: string;
  editId?: string;
}
