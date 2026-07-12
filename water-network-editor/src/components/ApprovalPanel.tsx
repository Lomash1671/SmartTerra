import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Badge,
  Divider,
  Grid,
  Paper,
} from '@mui/material';
import { Forum, Close, ArrowForward, CheckCircle, HighlightOff } from '@mui/icons-material';
import { useAppStore, USERS } from '../store/useAppStore';
import ConversationPanel from './ConversationPanel';

const ApprovalPanel = () => {
  const { currentUser, edits, updateEdit } = useAppStore();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const pendingEdits = Object.values(edits).filter((edit) =>
    currentUser?.role === 'Admin'
      ? edit.state === 'Pending Approval'
      : edit.state === 'Draft' || edit.state === 'Pending Approval' || edit.state === 'Rejected'
  );

  const handleApprove = (id: string) => {
    updateEdit(id, { state: 'Approved' }, { action: 'Approved', description: 'Admin approved the network changes.' });
  };

  const handleRejectClick = (id: string) => {
    setRejectingId(id);
    setRejectReason('');
  };

  const submitReject = (id: string) => {
    updateEdit(
      id,
      { state: 'Rejected', rejectReason },
      { action: 'Rejected', description: 'Admin rejected the proposed edit.' }
    );
    setRejectingId(null);
  };

  const handleSubmitApproval = (id: string) => {
    updateEdit(
      id,
      { state: 'Pending Approval' },
      { action: 'Submitted', description: 'Editor submitted edit to Admin for approval.' }
    );
  };

  const getUserDisplay = (id: string) => {
    if (id === 'SYSTEM') return 'System';
    const user = USERS.find((u) => u.id === id);
    return user ? `${user.name} (${user.role})` : id;
  };

  const getStatusChip = (state: string) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    switch (state) {
      case 'Draft':
        color = 'secondary';
        break;
      case 'Assigned':
        color = 'warning';
        break;
      case 'Pending Approval':
        color = 'info';
        break;
      case 'Approved':
        color = 'success';
        break;
      case 'Rejected':
        color = 'error';
        break;
    }
    return <Chip label={state} size="small" color={color} sx={{ fontWeight: 600 }} />;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, bgcolor: 'success.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckCircle />
        <Typography variant="h6" fontWeight="bold">
          {currentUser?.role === 'Admin' ? 'Pending Approvals' : 'My Edits'}
        </Typography>
      </Box>

      <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
        {pendingEdits.length === 0 ? (
          <Typography color="text.secondary">No edits found.</Typography>
        ) : (
          <Stack spacing={2.5}>
            {pendingEdits.map((edit) => (
              <Card key={edit.id} variant="outlined" sx={{ borderRadius: 2, boxShadow: 1 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Element: {edit.elementId || 'New'}
                    </Typography>
                    {getStatusChip(edit.state)}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    Created by: <strong>{getUserDisplay(edit.createdBy)}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2} sx={{ fontSize: '0.85rem' }}>
                    Updated: {new Date(edit.updatedAt).toLocaleString()}
                  </Typography>

                  {edit.before && edit.after && (
                    <Box sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', mb: 2 }}>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" mb={0.8}>
                        Proposed Changes:
                      </Typography>
                      <Stack spacing={0.5}>
                        {Object.keys(edit.after.properties).map((key) => {
                          const beforeVal = edit.before?.properties[key];
                          const afterVal = edit.after?.properties[key];
                          if (beforeVal !== afterVal) {
                            return (
                              <Box key={key} display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
                                <Typography variant="caption" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                                  {key}:
                                </Typography>
                                <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'error.main' }}>
                                  {beforeVal ?? 'None'}
                                </Typography>
                                <ArrowForward sx={{ fontSize: 12, color: 'text.secondary' }} />
                                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                  {afterVal ?? 'None'}
                                </Typography>
                              </Box>
                            );
                          }
                          return null;
                        })}
                        {Object.keys(edit.before.properties)
                          .filter((k) => !(k in edit.after!.properties))
                          .map((key) => (
                            <Box key={key} display="flex" alignItems="center" gap={0.5}>
                              <Typography variant="caption" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                                {key}:
                              </Typography>
                              <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'error.main' }}>
                                {edit.before!.properties[key]}
                              </Typography>
                              <ArrowForward sx={{ fontSize: 12, color: 'text.secondary' }} />
                              <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                                Removed
                              </Typography>
                            </Box>
                          ))}
                      </Stack>
                    </Box>
                  )}

                  {edit.before === null && edit.after && (
                    <Box sx={{ bgcolor: 'success.light', p: 1.5, borderRadius: 1.5, mb: 2, color: 'success.contrastText' }}>
                      <Typography variant="body2" fontWeight="bold">Action: Create Element ({edit.after.type})</Typography>
                    </Box>
                  )}

                  {edit.before && edit.after === null && (
                    <Box sx={{ bgcolor: 'error.light', p: 1.5, borderRadius: 1.5, mb: 2, color: 'error.contrastText' }}>
                      <Typography variant="body2" fontWeight="bold">Action: Delete Element ({edit.before.type})</Typography>
                    </Box>
                  )}

                  {edit.rejectReason && (
                    <Box sx={{ bgcolor: 'error.light', p: 1.5, borderRadius: 1.5, mb: 2, color: 'error.contrastText', display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="caption" fontWeight="bold">Rejection Reason:</Typography>
                      <Typography variant="body2">{edit.rejectReason}</Typography>
                    </Box>
                  )}

                  {edit.taskSubmission && (
                    <Paper variant="outlined" sx={{ mb: 2, borderRadius: 2, overflow: 'hidden', borderColor: 'warning.light' }}>

                      {/* ── Header ── */}
                      <Box sx={{ px: 2, py: 1, bgcolor: 'warning.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle fontSize="small" />
                        <Typography variant="body2" fontWeight="bold">Operator Field Report</Typography>
                        <Chip
                          label={`Condition: ${edit.taskSubmission.condition}`}
                          size="small"
                          sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, fontSize: '0.65rem', height: 18 }}
                        />
                      </Box>

                      {/* ── MODIFY: show only changed fields, 2-col (Original → Proposed) ── */}
                      {edit.before && edit.after && (() => {
                        const changedKeys = [
                          ...Object.keys(edit.after.properties).filter(k => edit.before!.properties[k] !== edit.after!.properties[k]),
                          ...Object.keys(edit.before.properties).filter(k => !(k in edit.after!.properties)),
                        ];
                        if (changedKeys.length === 0) return (
                          <Box sx={{ px: 2, py: 1.2, bgcolor: 'grey.50' }}>
                            <Typography variant="caption" color="text.secondary">No property changes detected.</Typography>
                          </Box>
                        );
                        return (
                          <>
                            <Grid container sx={{ px: 2, py: 0.8, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                              {[['FIELD', 'text.secondary'], ['ORIGINAL', 'text.secondary'], ['PROPOSED', 'primary.main']].map(([label, color]) => (
                                <Grid item xs={4} key={label}>
                                  <Typography variant="caption" fontWeight="bold" color={color}
                                    sx={{ textTransform: 'uppercase', fontSize: '0.58rem', letterSpacing: 0.5 }}>
                                    {label}
                                  </Typography>
                                </Grid>
                              ))}
                            </Grid>
                            <Stack divider={<Divider />}>
                              {changedKeys.map(key => {
                                const origVal = edit.before!.properties[key];
                                const propVal = key in edit.after!.properties ? String(edit.after!.properties[key]) : null;
                                return (
                                  <Grid container key={key} alignItems="center"
                                    sx={{ px: 2, py: 0.9, '&:hover': { bgcolor: 'action.hover' }, transition: 'background 0.15s' }}>
                                    <Grid item xs={4}>
                                      <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'capitalize', color: 'text.primary', fontSize: '0.72rem' }}>
                                        {key}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                      <Chip label={origVal != null ? String(origVal) : '—'} size="small"
                                        sx={{ bgcolor: '#f3f4f6', color: '#374151', fontWeight: 500, fontSize: '0.68rem', height: 18, textDecoration: 'line-through' }} />
                                    </Grid>
                                    <Grid item xs={4}>
                                      {propVal === null
                                        ? <Chip label="Removed" size="small" color="error" sx={{ fontWeight: 700, fontSize: '0.68rem', height: 18 }} />
                                        : <Chip label={propVal} size="small" sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 700, fontSize: '0.68rem', height: 18 }} />
                                      }
                                    </Grid>
                                  </Grid>
                                );
                              })}
                            </Stack>
                          </>
                        );
                      })()}

                      {/* ── CREATE: show all proposed properties, 2-col ── */}
                      {edit.before === null && edit.after && (() => {
                        const keys = Object.keys(edit.after.properties);
                        return (
                          <>
                            <Grid container sx={{ px: 2, py: 0.8, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                              {[['FIELD', 'text.secondary'], ['PROPOSED VALUE', 'primary.main']].map(([label, color]) => (
                                <Grid item xs={6} key={label}>
                                  <Typography variant="caption" fontWeight="bold" color={color}
                                    sx={{ textTransform: 'uppercase', fontSize: '0.58rem', letterSpacing: 0.5 }}>
                                    {label}
                                  </Typography>
                                </Grid>
                              ))}
                            </Grid>
                            <Stack divider={<Divider />}>
                              {keys.map(key => (
                                <Grid container key={key} alignItems="center"
                                  sx={{ px: 2, py: 0.9, '&:hover': { bgcolor: 'action.hover' }, transition: 'background 0.15s' }}>
                                  <Grid item xs={6}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'capitalize', color: 'text.primary', fontSize: '0.72rem' }}>
                                      {key}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Chip label={String(edit.after!.properties[key])} size="small"
                                      sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 700, fontSize: '0.68rem', height: 18 }} />
                                  </Grid>
                                </Grid>
                              ))}
                            </Stack>
                          </>
                        );
                      })()}

                      {/* ── DELETE: show all current properties, 2-col strikethrough ── */}
                      {edit.before && edit.after === null && (() => {
                        const keys = Object.keys(edit.before.properties);
                        return (
                          <>
                            <Grid container sx={{ px: 2, py: 0.8, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                              {[['FIELD', 'text.secondary'], ['CURRENT VALUE', 'error.main']].map(([label, color]) => (
                                <Grid item xs={6} key={label}>
                                  <Typography variant="caption" fontWeight="bold" color={color}
                                    sx={{ textTransform: 'uppercase', fontSize: '0.58rem', letterSpacing: 0.5 }}>
                                    {label}
                                  </Typography>
                                </Grid>
                              ))}
                            </Grid>
                            <Stack divider={<Divider />}>
                              {keys.map(key => (
                                <Grid container key={key} alignItems="center"
                                  sx={{ px: 2, py: 0.9, '&:hover': { bgcolor: 'action.hover' }, transition: 'background 0.15s' }}>
                                  <Grid item xs={6}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'capitalize', color: 'text.primary', fontSize: '0.72rem' }}>
                                      {key}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Chip label={String(edit.before!.properties[key])} size="small"
                                      sx={{ bgcolor: '#fde8e8', color: '#c62828', fontWeight: 600, fontSize: '0.68rem', height: 18, textDecoration: 'line-through' }} />
                                  </Grid>
                                </Grid>
                              ))}
                            </Stack>
                          </>
                        );
                      })()}

                      {/* ── Operator Observation Summary (single value, always shown) ── */}
                      <Box sx={{ px: 2, py: 1.5, bgcolor: '#fffbeb', borderTop: '1px solid', borderColor: 'warning.light' }}>
                        <Typography variant="caption" color="warning.dark" fontWeight="bold" display="block" mb={0.5}>
                          Operator's Observation:
                        </Typography>
                        <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                          "{edit.taskSubmission.observedValue}"
                        </Typography>
                        {edit.taskSubmission.notes && (
                          <Typography variant="caption" color="text.secondary" display="block" mt={0.8} sx={{ fontStyle: 'italic' }}>
                            Notes: {edit.taskSubmission.notes}
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  )}

                  <Stack spacing={1} mt={2}>
                    {currentUser?.role === 'Admin' && edit.state === 'Pending Approval' && (
                      <Stack direction="row" spacing={1} width="100%">
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          fullWidth
                          startIcon={<CheckCircle />}
                          onClick={() => handleApprove(edit.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          fullWidth
                          startIcon={<HighlightOff />}
                          onClick={() => handleRejectClick(edit.id)}
                        >
                          Reject
                        </Button>
                      </Stack>
                    )}

                    {currentUser?.role === 'Editor' && edit.state === 'Draft' && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        fullWidth
                        onClick={() => handleSubmitApproval(edit.id)}
                      >
                        Submit for Approval
                      </Button>
                    )}

                    <Button
                      variant="outlined"
                      color="info"
                      size="small"
                      startIcon={<Badge badgeContent={edit.comments.length} color="error"><Forum fontSize="small" /></Badge>}
                      onClick={() => setActiveChatId(edit.id)}
                      fullWidth
                    >
                      Discussion ({edit.comments.length})
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {/* Reject Reason Confirmation Dialog */}
      <Dialog open={rejectingId !== null} onClose={() => setRejectingId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Reject proposed edit?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Please state a rejection reason so the Editor knows what changes are required.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            type="text"
            fullWidth
            variant="outlined"
            size="small"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectingId(null)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => rejectingId && submitReject(rejectingId)}
            color="error"
            variant="contained"
            disabled={!rejectReason.trim()}
          >
            Confirm Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Discussion Chat Dialog */}
      <Dialog open={activeChatId !== null} onClose={() => setActiveChatId(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'info.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Discussion - Edit {activeChatId && edits[activeChatId]?.elementId}
          </Typography>
          <IconButton onClick={() => setActiveChatId(null)} size="small" sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: 400 }}>
          {activeChatId && <ConversationPanel editId={activeChatId} minHeight={400} />}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ApprovalPanel;
