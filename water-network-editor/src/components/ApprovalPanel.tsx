import { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Stack, Chip, Divider, TextField } from '@mui/material';
import { useAppStore } from '../store/useAppStore';
import ConversationPanel from './ConversationPanel';

const ApprovalPanel = () => {
  const { currentUser, edits, updateEdit } = useAppStore();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const pendingEdits = Object.values(edits).filter(edit => 
    currentUser?.role === 'Admin' ? edit.state === 'Pending Approval' : (edit.state === 'Draft' || edit.state === 'Pending Approval' || edit.state === 'Rejected')
  );

  const handleApprove = (id: string) => {
    updateEdit(id, { state: 'Approved' }, { action: 'Approved', description: 'Admin approved the network changes.' });
  };

  const handleRejectClick = (id: string) => {
    setRejectingId(id);
    setRejectReason('');
  };

  const submitReject = (id: string) => {
    updateEdit(id, { state: 'Rejected', rejectReason }, { action: 'Rejected', description: 'Admin rejected the proposed edit.' });
    setRejectingId(null);
  };

  const handleSubmitApproval = (id: string) => {
    updateEdit(id, { state: 'Pending Approval' }, { action: 'Submitted', description: 'Editor submitted edit to Admin for approval.' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, bgcolor: 'success.main', color: 'white' }}>
        <Typography variant="h6">
          {currentUser?.role === 'Admin' ? 'Pending Approvals' : 'My Edits'}
        </Typography>
      </Box>

      <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
        {pendingEdits.length === 0 ? (
          <Typography color="text.secondary">No edits found.</Typography>
        ) : (
          <Stack spacing={2}>
            {pendingEdits.map(edit => (
              <Card key={edit.id} variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="subtitle1" fontWeight="bold">Element: {edit.elementId || 'New'}</Typography>
                    <Chip label={edit.state} size="small" color={edit.state === 'Pending Approval' ? 'warning' : edit.state === 'Rejected' ? 'error' : 'default'} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">Created by User: {edit.createdBy}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>Updated: {new Date(edit.updatedAt).toLocaleString()}</Typography>

                  {edit.before && edit.after && (
                    <Box bgcolor="info.light" p={1} borderRadius={1} mb={2}>
                      <Typography variant="body2" fontWeight="bold">Property Changes:</Typography>
                      {Object.keys(edit.after.properties).map(key => {
                        const beforeVal = edit.before?.properties[key];
                        const afterVal = edit.after?.properties[key];
                        if (beforeVal !== afterVal) {
                          return (
                            <Typography key={key} variant="caption" display="block">
                              <strong>{key}:</strong> <span style={{ textDecoration: 'line-through', color: '#d32f2f' }}>{beforeVal || 'None'}</span> <span>&rarr;</span> <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>{afterVal}</span>
                            </Typography>
                          );
                        }
                        return null;
                      })}
                      {Object.keys(edit.before.properties).filter(k => !(k in edit.after!.properties)).map(key => (
                         <Typography key={key} variant="caption" display="block">
                            <strong>{key}:</strong> <span style={{ textDecoration: 'line-through', color: '#d32f2f' }}>{edit.before!.properties[key]}</span> <span>&rarr;</span> <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>Removed</span>
                         </Typography>
                      ))}
                    </Box>
                  )}
                  
                  {edit.before === null && edit.after && (
                    <Box bgcolor="success.light" p={1} borderRadius={1} mb={2} color="white">
                      <Typography variant="body2" fontWeight="bold">Action: Element Created</Typography>
                    </Box>
                  )}

                  {edit.before && edit.after === null && (
                    <Box bgcolor="error.light" p={1} borderRadius={1} mb={2} color="white">
                      <Typography variant="body2" fontWeight="bold">Action: Element Deleted</Typography>
                    </Box>
                  )}
                  {edit.rejectReason && (
                    <Box bgcolor="error.light" p={1} borderRadius={1} mb={2}>
                      <Typography variant="body2" color="white" fontWeight="bold">Rejection Reason:</Typography>
                      <Typography variant="body2" color="white">{edit.rejectReason}</Typography>
                    </Box>
                  )}

                  {edit.taskSubmission && (
                    <Box bgcolor="grey.100" p={1} borderRadius={1} mb={2}>
                      <Typography variant="body2" fontWeight="bold">Operator Submission:</Typography>
                      <Typography variant="body2">Condition: {edit.taskSubmission.condition}</Typography>
                      <Typography variant="body2">Observed: {edit.taskSubmission.observedValue}</Typography>
                      <Typography variant="body2">Notes: {edit.taskSubmission.notes}</Typography>
                    </Box>
                  )}

                  {currentUser?.role === 'Admin' && edit.state === 'Pending Approval' && (
                    <Stack spacing={1} mb={2}>
                      {rejectingId === edit.id ? (
                        <>
                          <TextField 
                            size="small" 
                            label="Reject Reason" 
                            value={rejectReason} 
                            onChange={(e) => setRejectReason(e.target.value)} 
                            fullWidth 
                          />
                          <Stack direction="row" spacing={1}>
                            <Button variant="contained" color="error" size="small" onClick={() => submitReject(edit.id)}>Confirm Reject</Button>
                            <Button variant="text" size="small" onClick={() => setRejectingId(null)}>Cancel</Button>
                          </Stack>
                        </>
                      ) : (
                        <Stack direction="row" spacing={1}>
                          <Button variant="contained" color="success" size="small" onClick={() => handleApprove(edit.id)}>Approve</Button>
                          <Button variant="outlined" color="error" size="small" onClick={() => handleRejectClick(edit.id)}>Reject</Button>
                        </Stack>
                      )}
                    </Stack>
                  )}

                  {currentUser?.role === 'Editor' && (edit.state === 'Draft' || edit.state === 'Rejected') && (
                    <Stack direction="row" spacing={1} mb={2}>
                      <Button variant="contained" color="primary" size="small" onClick={() => handleSubmitApproval(edit.id)}>
                        Submit for Approval
                      </Button>
                    </Stack>
                  )}
                  
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" fontWeight="bold" gutterBottom>Discussion</Typography>
                  <ConversationPanel editId={edit.id} minHeight={150} />

                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default ApprovalPanel;
