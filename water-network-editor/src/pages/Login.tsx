import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { WaterDrop } from '@mui/icons-material';
import { useAppStore, USERS } from '../store/useAppStore';

const Login = () => {
  const setCurrentUser = useAppStore(state => state.setCurrentUser);

  return (
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.light' }}>
      <Paper sx={{ p: 6, maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: 3 }}>
        <WaterDrop sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Water Network
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Select a role to continue
        </Typography>

        <Stack spacing={2}>
          {USERS.map(user => (
            <Button
              key={user.id}
              variant="outlined"
              size="large"
              color={user.role === 'Admin' ? 'error' : user.role === 'Editor' ? 'primary' : 'success'}
              onClick={() => setCurrentUser(user)}
              fullWidth
            >
              Log in as {user.name} ({user.role})
            </Button>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

export default Login;
