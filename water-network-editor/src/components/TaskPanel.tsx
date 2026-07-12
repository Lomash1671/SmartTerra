import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Stack,
  Chip,
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
import {
  Assignment,
  Forum,
  Close,
  CheckCircle,
  AddCircleOutline,
  DeleteForever,
  CompareArrows,
  ArrowForward,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useAppStore, USERS } from '../store/useAppStore';
import ConversationPanel from './ConversationPanel';

// ─── SuggestedChangesDiff ────────────────────────────────────────────────────
const SuggestedChangesDiff = ({ task }: { task: any }) => {
  const hasChanges = task.before && task.after;
  const isCreate = task.before === null && task.after;
  const isDelete = task.before && task.after === null;

  // ── Property modification diff ──
  if (hasChanges) {
    const changedKeys: string[] = [];
    // Keys in after that changed
    Object.keys(task.after.properties).forEach((k) => {
      if (task.before.properties[k] !== task.after.properties[k]) {
        changedKeys.push(k);
      }
    });
    // Keys in before that were removed
    Object.keys(task.before.properties).forEach((k) => {
      if (!(k in task.after.properties)) changedKeys.push(k);
    });

    if (changedKeys.length === 0) {
      return (
        <Box sx={{ mt: 2, mb: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            No property changes detected.
          </Typography>
        </Box>
      );
    }

    return (
      <Paper
        variant="outlined"
        sx={{
          mt: 2,
          mb: 1,
          borderRadius: 2,
          overflow: 'hidden',
          borderColor: 'primary.light',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <CompareArrows fontSize="small" />
          <Typography variant="body2" fontWeight="bold">
            Suggested Changes
          </Typography>
          <Chip
            label={`${changedKeys.length} field${changedKeys.length > 1 ? 's' : ''} changed`}
            size="small"
            sx={{
              ml: 'auto',
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 700,
              height: 18,
            }}
          />
        </Box>

        {/* Column Headers */}
        <Grid container sx={{ px: 2, py: 0.8, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Grid item xs={3.5}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: 0.5 }}>
              Field
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" fontWeight="bold" color="error.main" sx={{ textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: 0.5 }}>
              Previous
            </Typography>
          </Grid>
          <Grid item xs={4.5}>
            <Typography variant="caption" fontWeight="bold" color="success.main" sx={{ textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: 0.5 }}>
              Suggested
            </Typography>
          </Grid>
        </Grid>

        {/* Rows */}
        <Stack divider={<Divider />}>
          {changedKeys.map((key) => {
            const prevVal = key in task.before.properties ? String(task.before.properties[key]) : null;
            const nextVal = key in task.after.properties ? String(task.after.properties[key]) : null;
            const isRemoved = nextVal === null;

            return (
              <Grid
                container
                key={key}
                alignItems="center"
                sx={{
                  px: 2,
                  py: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                  transition: 'background 0.15s',
                }}
              >
                {/* Field name */}
                <Grid item xs={3.5}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, textTransform: 'capitalize', color: 'text.primary' }}
                  >
                    {key}
                  </Typography>
                </Grid>

                {/* Previous value */}
                <Grid item xs={4}>
                  <Chip
                    label={prevVal ?? '—'}
                    size="small"
                    sx={{
                      bgcolor: '#fde8e8',
                      color: '#c62828',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 20,
                      textDecoration: 'line-through',
                      maxWidth: '100%',
                    }}
                  />
                </Grid>

                {/* Arrow */}
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 0.5 }}>
                  <ArrowForward sx={{ fontSize: 12, color: 'text.disabled' }} />
                </Box>

                {/* Suggested value */}
                <Grid item xs={4}>
                  {isRemoved ? (
                    <Chip
                      label="Removed"
                      size="small"
                      color="error"
                      sx={{ fontWeight: 700, fontSize: '0.7rem', height: 20 }}
                    />
                  ) : (
                    <Chip
                      label={nextVal}
                      size="small"
                      sx={{
                        bgcolor: '#e6f4ea',
                        color: '#2e7d32',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        height: 20,
                        maxWidth: '100%',
                      }}
                    />
                  )}
                </Grid>
              </Grid>
            );
          })}
        </Stack>
      </Paper>
    );
  }

  // ── New element ──
  if (isCreate) {
    const allKeys = Object.keys(task.after.properties);
    return (
      <Paper
        variant="outlined"
        sx={{ mt: 2, mb: 1, borderRadius: 2, overflow: 'hidden', borderColor: 'success.light' }}
      >
        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: 'success.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <AddCircleOutline fontSize="small" />
          <Typography variant="body2" fontWeight="bold">
            New Element
          </Typography>
          <Chip
            label={task.after.type}
            size="small"
            sx={{
              ml: 'auto',
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 700,
              height: 18,
            }}
          />
        </Box>

        <Grid container sx={{ px: 2, py: 0.8, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Grid item xs={4}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: 0.5 }}>
              Field
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="caption" fontWeight="bold" color="success.main" sx={{ textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: 0.5 }}>
              Value
            </Typography>
          </Grid>
        </Grid>

        <Stack divider={<Divider />}>
          {allKeys.map((key) => (
            <Grid
              container
              key={key}
              alignItems="center"
              sx={{ px: 2, py: 1, '&:hover': { bgcolor: 'action.hover' } }}
            >
              <Grid item xs={4}>
                <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'capitalize', color: 'text.primary' }}>
                  {key}
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Chip
                  label={String(task.after.properties[key])}
                  size="small"
                  sx={{
                    bgcolor: '#e6f4ea',
                    color: '#2e7d32',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    height: 20,
                  }}
                />
              </Grid>
            </Grid>
          ))}
        </Stack>
      </Paper>
    );
  }

  // ── Deletion ──
  if (isDelete) {
    const allKeys = Object.keys(task.before.properties);
    return (
      <Paper
        variant="outlined"
        sx={{ mt: 2, mb: 1, borderRadius: 2, overflow: 'hidden', borderColor: 'error.light' }}
      >
        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: 'error.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <DeleteForever fontSize="small" />
          <Typography variant="body2" fontWeight="bold">
            Element Marked for Deletion
          </Typography>
          <Chip
            label={task.before.type}
            size="small"
            sx={{
              ml: 'auto',
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 700,
              height: 18,
            }}
          />
        </Box>

        <Box sx={{ px: 2, py: 1.2, bgcolor: '#fde8e8' }}>
          <Typography variant="body2" color="error.dark" sx={{ fontSize: '0.8rem' }}>
            ⚠️ The Editor has requested to <strong>delete</strong> this element. Please visit the
            site and verify whether removal is safe before the Admin approves.
          </Typography>
        </Box>

        <Grid container sx={{ px: 2, py: 0.8, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Grid item xs={4}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: 0.5 }}>
              Field
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="caption" fontWeight="bold" color="error.main" sx={{ textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: 0.5 }}>
              Current Value
            </Typography>
          </Grid>
        </Grid>

        <Stack divider={<Divider />}>
          {allKeys.map((key) => (
            <Grid
              container
              key={key}
              alignItems="center"
              sx={{ px: 2, py: 1, '&:hover': { bgcolor: 'action.hover' } }}
            >
              <Grid item xs={4}>
                <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'capitalize', color: 'text.primary' }}>
                  {key}
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Chip
                  label={String(task.before.properties[key])}
                  size="small"
                  sx={{
                    bgcolor: '#fde8e8',
                    color: '#c62828',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 20,
                    textDecoration: 'line-through',
                  }}
                />
              </Grid>
            </Grid>
          ))}
        </Stack>
      </Paper>
    );
  }

  return null;
};

interface TaskFormData {
  observedValue: string;
  condition: string;
  notes: string;
}

const TaskCard = ({ task, currentUser, updateEdit, onOpenChat }: any) => {
  const [openObsDialog, setOpenObsDialog] = useState(false);

  const { register, handleSubmit } = useForm<TaskFormData>({
    defaultValues: {
      observedValue: task.taskSubmission?.observedValue || '',
      condition: task.taskSubmission?.condition || '',
      notes: task.taskSubmission?.notes || '',
    },
  });

  const onSubmit = (data: TaskFormData) => {
    updateEdit(
      task.id,
      {
        taskSubmission: data,
        state: 'Draft', // Return to editor as draft with the new observation data
      },
      {
        action: 'Submitted',
        description: 'Operator submitted field verification results and returned edit to Editor.',
      }
    );
    setOpenObsDialog(false);
  };

  // Find operator details
  const operatorUser = USERS.find((u) => u.id === task.assignedOperatorId);
  const operatorLabel = operatorUser ? `${operatorUser.name} (${operatorUser.role})` : `Operator ${task.assignedOperatorId}`;

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 1, border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Box display="flex" alignItems="center" gap={1}>
            <Assignment color="warning" />
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'text.primary' }}>
              Verification for {task.elementId || 'New Element'}
            </Typography>
          </Box>
          <Chip label="Assigned" size="small" color="warning" sx={{ fontWeight: 600 }} />
        </Box>

        <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
          Task ID: {task.id}
        </Typography>

        {/* Rich diff view */}
        <SuggestedChangesDiff task={task} />

        <Stack direction="row" spacing={1.5} mt={2.5}>
          {currentUser?.role === 'Operator' ? (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => setOpenObsDialog(true)}
              fullWidth
              startIcon={<CheckCircle fontSize="small" />}
              sx={{ fontWeight: 600 }}
            >
              Verify Task
            </Button>
          ) : (
            <Box sx={{ width: '100%', py: 0.8, px: 1.5, bgcolor: 'action.hover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Assigned Operator:
              </Typography>
              <Typography variant="body2" fontWeight="medium" color="text.primary">
                {operatorLabel}
              </Typography>
            </Box>
          )}

          <Button
            variant="outlined"
            color="info"
            size="small"
            onClick={() => onOpenChat(task.id)}
            sx={{ minWidth: 40, px: 2 }}
          >
            <Badge badgeContent={task.comments.length} color="error">
              <Forum fontSize="small" />
            </Badge>
          </Button>
        </Stack>

        {/* Verification Observation Dialog */}
        <Dialog open={openObsDialog} onClose={() => setOpenObsDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Submit Field Observations</DialogTitle>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Please check the physical installation in the field and record details below to complete your verification task.
              </Typography>

              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  autoFocus
                  required
                  size="small"
                  label="Observed Value"
                  {...register('observedValue', { required: true })}
                  placeholder="e.g. Measured 200mm diameter"
                  fullWidth
                />

                <TextField
                  required
                  size="small"
                  label="Condition Status"
                  {...register('condition', { required: true })}
                  placeholder="e.g. Good condition"
                  fullWidth
                />

                <TextField
                  size="small"
                  label="Observations / Notes"
                  multiline
                  rows={3}
                  {...register('notes')}
                  placeholder="Any additional notes about field observations..."
                  fullWidth
                />
              </Stack>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setOpenObsDialog(false)} color="inherit">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Submit Observations
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </CardContent>
    </Card>
  );
};

const TaskPanel = () => {
  const { currentUser, edits, updateEdit } = useAppStore();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const tasks = Object.values(edits).filter(
    (edit) =>
      edit.state === 'Assigned' &&
      (currentUser?.role !== 'Operator' || edit.assignedOperatorId === currentUser?.id)
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, bgcolor: 'warning.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Assignment />
        <Typography variant="h6" fontWeight="bold">
          {currentUser?.role === 'Operator' ? 'My Tasks' : 'Field Tasks'}
        </Typography>
      </Box>

      <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
        {tasks.length === 0 ? (
          <Typography color="text.secondary">No tasks assigned.</Typography>
        ) : (
          <Stack spacing={2}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                currentUser={currentUser}
                updateEdit={updateEdit}
                onOpenChat={(id: string) => setActiveChatId(id)}
              />
            ))}
          </Stack>
        )}
      </Box>

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

export default TaskPanel;
