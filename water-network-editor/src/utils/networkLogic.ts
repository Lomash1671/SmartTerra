import { v4 as uuidv4 } from 'uuid';
import { NetworkElement, Edit } from '../types';

export const splitPipe = (
  pipe: NetworkElement,
  newJunctionId: string,
  newJunctionCoords: number[]
): {
  deletedPipeEdit: Partial<Edit>;
  newPipe1Edit: Partial<Edit>;
  newPipe2Edit: Partial<Edit>;
} => {
  // original pipe properties
  const { startJunction, endJunction, ...restProps } = pipe.properties;

  const pipe1Id = `P-${uuidv4().substring(0,6)}`;
  const pipe2Id = `P-${uuidv4().substring(0,6)}`;

  const originalCoords = pipe.coordinates as number[][];
  
  // A perfect split routing would calculate projection on the linestring.
  // For simplicity since our initialNetwork lines are just 2 points, 
  // we'll assemble the new coordinates directly.
  const p1Coords = [originalCoords[0], newJunctionCoords];
  const p2Coords = [newJunctionCoords, originalCoords[1]];

  const dist = (c1: number[], c2: number[]) => Math.sqrt(Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2));
  const d1 = dist(originalCoords[0], newJunctionCoords);
  const d2 = dist(newJunctionCoords, originalCoords[1]);
  const totalD = d1 + d2;
  const ratio = totalD === 0 ? 0.5 : d1 / totalD;

  const originalLength = typeof restProps.length === 'number' ? restProps.length : (parseFloat(restProps.length) || 0);
  const length1 = Math.round(originalLength * ratio);
  const length2 = originalLength - length1;

  const deletedPipeEdit = {
    elementId: pipe.id,
    state: 'Draft' as const,
    before: pipe,
    after: null, // represents deletion
  };

  const newPipe1Edit = {
    elementId: pipe1Id,
    state: 'Draft' as const,
    before: null,
    after: {
      id: pipe1Id,
      type: 'Pipe' as const,
      coordinates: p1Coords,
      properties: {
        ...restProps,
        length: length1,
        startJunction,
        endJunction: newJunctionId
      }
    }
  };

  const newPipe2Edit = {
    elementId: pipe2Id,
    state: 'Draft' as const,
    before: null,
    after: {
      id: pipe2Id,
      type: 'Pipe' as const,
      coordinates: p2Coords,
      properties: {
        ...restProps,
        length: length2,
        startJunction: newJunctionId,
        endJunction
      }
    }
  };

  return { deletedPipeEdit, newPipe1Edit, newPipe2Edit };
};
