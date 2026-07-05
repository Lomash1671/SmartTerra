import { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Divider, IconButton, Stack, Snackbar, Alert } from '@mui/material';
import { Close, Delete } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { NetworkElement } from '../types';
import { useAppStore } from '../store/useAppStore';
import { splitPipe } from '../utils/networkLogic';
import ConversationPanel from './ConversationPanel';

interface PropertyPanelProps {
  element: NetworkElement | null;
  onClose: () => void;
}

const PropertyPanel = ({ element, onClose }: PropertyPanelProps) => {
  const { currentUser, edits, createEdit, updateEdit } = useAppStore();
  const { register, handleSubmit, reset } = useForm();
  const [savedMsg, setSavedMsg] = useState(false);
  
  const activeEdit = Object.values(edits).find(e => 
    e.elementId === element?.id && 
    (e.state === 'Draft' || e.state === 'Pending Approval' || e.state === 'Assigned' || e.state === 'Rejected')
  );

  useEffect(() => {
    if (element) {
      const defaultValues = activeEdit?.after?.properties || element.properties;
      reset(defaultValues);
    }
  }, [element, activeEdit, reset]);

  if (!element) return null;

  const isEditor = currentUser?.role === 'Editor';
  const canEdit = isEditor && (!activeEdit || activeEdit.state === 'Draft' || activeEdit.state === 'Rejected');

  const onSave = (data: any) => {
    // Merge form data INTO existing properties so that fields not shown in the
    // form (e.g. startJunction, endJunction, material) are NOT silently dropped.
    const mergedProperties = { ...element.properties, ...data };
    if (!activeEdit) {
      createEdit({
        elementId: element.id,
        state: 'Draft',
        before: element,
        after: { ...element, properties: mergedProperties }
      });
    } else {
      updateEdit(activeEdit.id, {
        state: 'Draft',
        after: { ...element, properties: mergedProperties }
      }, activeEdit.state === 'Rejected' ? { action: 'Draft', description: 'Editor revised rejected edit.' } : undefined);
    }
    setSavedMsg(true);
  };

  const handleDelete = () => {
    createEdit({
      elementId: element.id,
      state: 'Draft',
      before: element,
      after: null
    });

    // Cascade delete any pipes connected to this node
    if (element.type !== 'Pipe') {
      const currentNetwork = { ...useAppStore.getState().networkCache };
      const currentEdits = useAppStore.getState().edits;
      
      // Compute the current layout including any active drafts/pending edits
      Object.values(currentEdits).forEach(edit => {
        if (edit.state === 'Approved' || edit.state === 'Rejected') return;
        if (edit.after === null && edit.elementId) {
          delete currentNetwork[edit.elementId];
        } else if (edit.after) {
          currentNetwork[edit.after.id] = edit.after;
        }
      });

      // Find any pipes that start or end at the deleted element
      Object.values(currentNetwork).forEach(elem => {
        if (elem.type === 'Pipe') {
          const startJ = elem.properties?.startJunction;
          const endJ = elem.properties?.endJunction;
          if (startJ === element.id || endJ === element.id) {
            // Find existing edit for the pipe to mutate or create a new deletion edit
            const pipeEdit = Object.values(currentEdits).find(e => 
              e.elementId === elem.id && 
              (e.state === 'Draft' || e.state === 'Pending Approval' || e.state === 'Assigned' || e.state === 'Rejected')
            );
            if (pipeEdit) {
              updateEdit(pipeEdit.id, {
                state: 'Draft',
                after: null
              });
            } else {
              createEdit({
                elementId: elem.id,
                state: 'Draft',
                before: elem,
                after: null
              });
            }
          }
        }
      });
    }

    onClose();
  };

  const handleSubmitApproval = () => {
    if (activeEdit) {
      updateEdit(activeEdit.id, { state: 'Pending Approval' }, { action: 'Submitted', description: 'Editor submitted edit to Admin for approval.' });
    }
  };

  const handleAssignTask = () => {
    if (activeEdit) {
      updateEdit(activeEdit.id, { state: 'Assigned', assignedOperatorId: '3' }, { action: 'Assigned', description: 'Assigned field task to Operator 3.' });
    } else {
      createEdit({
        elementId: element.id,
        state: 'Assigned',
        assignedOperatorId: '3',
        before: element,
        after: element
      });
      // The createEdit automatically logs 'CREATE_EDIT'. If we want custom there, we can add it later, but this works.
    }
  };

  const handleSplitPipeAction = () => {
    const newJunctionId = `J-${Date.now()}`;
    const newJunctionCoords = [-0.085, 51.5075];
    const newJunctionEdit = {
      elementId: newJunctionId,
      state: 'Draft' as const,
      before: null,
      after: {
        id: newJunctionId,
        type: 'Junction' as const,
        coordinates: newJunctionCoords,
        properties: { elevation: 100, demand: 0 }
      }
    };

    const { deletedPipeEdit, newPipe1Edit, newPipe2Edit } = splitPipe(element, newJunctionId, newJunctionCoords);
    createEdit(deletedPipeEdit);
    createEdit(newJunctionEdit);
    createEdit(newPipe1Edit);
    createEdit(newPipe2Edit);
    onClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">{element.type} Properties</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}><Close /></IconButton>
      </Box>

      <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          ID: {element.id}
        </Typography>
        
        {activeEdit && (
          <Paper sx={{ p: 1, mb: 2, bgcolor: 'warning.light' }}>
            <Typography variant="body2" fontWeight="bold">Active Edit: {activeEdit.state}</Typography>
          </Paper>
        )}

        <form onSubmit={handleSubmit(onSave)}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {element.type === 'Pipe' && (
              <>
                <TextField label="Diameter" size="small" {...register('diameter')} disabled={!canEdit} fullWidth />
                <TextField label="Length" size="small" {...register('length')} disabled={!canEdit} fullWidth />
                <TextField label="Roughness" size="small" {...register('roughness')} disabled={!canEdit} fullWidth />
                <TextField label="Status" size="small" {...register('status')} disabled={!canEdit} fullWidth />
              </>
            )}
            {element.type === 'Valve' && (
              <>
                <TextField label="Diameter" size="small" {...register('diameter')} disabled={!canEdit} fullWidth />
                <TextField label="Setting" size="small" {...register('setting')} disabled={!canEdit} fullWidth />
                <TextField label="Status" size="small" {...register('status')} disabled={!canEdit} fullWidth />
              </>
            )}
            {element.type === 'Junction' && (
              <>
                <TextField label="Elevation" size="small" {...register('elevation')} disabled={!canEdit} fullWidth />
                <TextField label="Demand" size="small" {...register('demand')} disabled={!canEdit} fullWidth />
              </>
            )}
            {element.type === 'Reservoir' && (
              <>
                <TextField label="Head" size="small" {...register('head')} disabled={!canEdit} fullWidth />
              </>
            )}
          </Stack>

          <Divider sx={{ my: 3 }} />

          {isEditor && (
            <Stack spacing={2}>
              {canEdit && (
                <Button type="submit" variant="contained">Save Draft</Button>
              )}
              {(activeEdit?.state === 'Draft' || activeEdit?.state === 'Rejected') && (
                 <Button variant="contained" color="secondary" onClick={handleSubmitApproval}>Submit for Approval</Button>
              )}
              {(canEdit || activeEdit?.state === 'Draft') && (
                 <Button variant="outlined" color="primary" onClick={handleAssignTask}>Assign to Operator</Button>
              )}
              {canEdit && (
                 <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleDelete}>Delete Element</Button>
              )}
              {element.type === 'Pipe' && canEdit && (
                 <Button variant="outlined" color="warning" onClick={handleSplitPipeAction}>Simulate Pipe Split (Midpoint)</Button>
              )}
            </Stack>
          )}
        </form>
      </Box>
      
      {activeEdit && (
        <Box sx={{ height: 250, borderTop: 1, borderColor: 'divider' }}>
          <ConversationPanel editId={activeEdit.id} />
        </Box>
      )}

      <Snackbar
        open={savedMsg}
        autoHideDuration={2500}
        onClose={() => setSavedMsg(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSavedMsg(false)} sx={{ width: '100%' }}>
          Draft saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PropertyPanel;
