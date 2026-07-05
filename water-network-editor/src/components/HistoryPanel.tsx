import { Box, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useAppStore, USERS } from '../store/useAppStore';

const HistoryPanel = () => {
  const { auditLogs } = useAppStore();

  const getUserName = (id: string) => {
    if (id === 'SYSTEM') return 'System';
    const user = USERS.find(u => u.id === id);
    return user ? user.name : id;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, bgcolor: 'grey.800', color: 'white' }}>
        <Typography variant="h6">Audit Trail</Typography>
      </Box>

      <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
        {auditLogs.length === 0 ? (
          <Typography color="text.secondary">No audit logs available.</Typography>
        ) : (
          <List>
            {auditLogs.map((log, i) => (
              <Box key={log.id}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" color="primary">
                        {log.action}
                      </Typography>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                        <Typography variant="body2" color="text.primary" component="span">
                          {log.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="span">
                          By: {getUserName(log.userId)} | {new Date(log.timestamp).toLocaleString()}
                        </Typography>
                        {log.editId && (
                          <Typography variant="caption" color="text.secondary" component="span">
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
