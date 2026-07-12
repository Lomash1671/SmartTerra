import { Box, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import {
  AddCircleOutline,
  CheckCircle,
  Cancel,
  Send,
  HelpOutline,
  History,
  Lock,
} from '@mui/icons-material';
import { useAppStore, USERS } from '../store/useAppStore';

const HistoryPanel = () => {
  const { auditLogs } = useAppStore();

  const getUserDisplay = (id: string) => {
    if (id === 'SYSTEM') return 'System';
    const user = USERS.find((u) => u.id === id);
    return user ? `${user.name} (${user.role})` : id;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE_EDIT':
        return <AddCircleOutline color="primary" sx={{ fontSize: 20 }} />;
      case 'PUBLISH_EDIT':
      case 'Approved':
        return <CheckCircle color="success" sx={{ fontSize: 20 }} />;
      case 'Rejected':
        return <Cancel color="error" sx={{ fontSize: 20 }} />;
      case 'Submitted':
        return <Send color="info" sx={{ fontSize: 20 }} />;
      case 'Draft':
        return <Send color="action" sx={{ fontSize: 20 }} />;
      case 'Assigned':
        return <Lock color="warning" sx={{ fontSize: 20 }} />;
      default:
        return <HelpOutline color="disabled" sx={{ fontSize: 20 }} />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, bgcolor: 'grey.800', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
        <History />
        <Typography variant="h6" fontWeight="bold">Audit Trail</Typography>
      </Box>

      <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
        {auditLogs.length === 0 ? (
          <Typography color="text.secondary">No audit logs available.</Typography>
        ) : (
          <List sx={{ p: 0 }}>
            {auditLogs.map((log, i) => (
              <Box key={log.id}>
                <ListItem alignItems="flex-start" sx={{ px: 0.5, py: 1.5 }}>
                  <Box sx={{ mr: 1.5, mt: 0.3 }}>{getActionIcon(log.action)}</Box>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 'bold' }}>
                        {log.action.replace('_', ' ')}
                      </Typography>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary" component="span" sx={{ mb: 0.5, leadingHeight: 1.3 }}>
                          {log.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="span" sx={{ fontSize: '0.72rem' }}>
                          By: <strong>{getUserDisplay(log.userId)}</strong> | {new Date(log.timestamp).toLocaleString()}
                        </Typography>
                        {log.editId && (
                          <Typography variant="caption" color="text.secondary" component="span" sx={{ fontSize: '0.68rem', mt: 0.2 }}>
                            Edit ID: {log.editId}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {i < auditLogs.length - 1 && <Divider component="li" />}
              </Box>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default HistoryPanel;
