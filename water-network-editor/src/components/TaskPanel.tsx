import { Box, Typography, Card, CardContent, Button, TextField, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAppStore } from '../store/useAppStore';
import ConversationPanel from './ConversationPanel';

interface TaskFormData {
  observedValue: string;
  condition: string;
  notes: string;
}

const TaskCard = ({ task, currentUser, updateEdit }: any) => {
  const { register, handleSubmit } = useForm<TaskFormData>({
    defaultValues: {
      observedValue: '',
      condition: '',
      notes: ''
    }
  });

  const onSubmit = (data: TaskFormData) => {
    updateEdit(task.id, {
      taskSubmission: data,
      state: 'Draft' // Return to editor as draft with the new observation data
    }, { 
      action: 'Submitted', 
      description: 'Operator submitted field verification results and returned edit to Editor.' 
    });
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold">Task for {task.elementId || 'New Element'}</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>Edit ID: {task.id}</Typography>
        
        {currentUser?.role === 'Operator' ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2} mt={2}>
              <TextField 
                size="small" 
                label="Observed Value" 
                {...register('observedValue')}
                fullWidth
              />
              <TextField 
                size="small" 
                label="Condition" 
                {...register('condition')}
                fullWidth
              />
              <TextField 
                size="small" 
                label="Notes" 
                multiline 
                rows={2}
                {...register('notes')}
                fullWidth
              />
              <Button type="submit" variant="contained" color="primary">
                Submit Verification
              </Button>
            </Stack>
          </form>
        ) : (
          <Typography variant="body2" color="info.main" mt={2}>Assigned to Operator {task.assignedOperatorId}</Typography>
        )}
        
        <Box mt={2} height={150}>
          <ConversationPanel editId={task.id} minHeight={150} />
        </Box>
      </CardContent>
    </Card>
  );
};

const TaskPanel = () => {
  const { currentUser, edits, updateEdit } = useAppStore();

  const tasks = Object.values(edits).filter(edit => 
    edit.state === 'Assigned' && 
    (currentUser?.role !== 'Operator' || edit.assignedOperatorId === currentUser?.id)
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, bgcolor: 'warning.main', color: 'white' }}>
        <Typography variant="h6">Assigned Tasks</Typography>
      </Box>

      <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
        {tasks.length === 0 ? (
          <Typography color="text.secondary">No tasks assigned.</Typography>
        ) : (
          <Stack spacing={2}>
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} currentUser={currentUser} updateEdit={updateEdit} />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default TaskPanel;
