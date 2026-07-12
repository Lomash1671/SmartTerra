import { Box, Typography, Paper, Stack, Card, CardActionArea, CardContent, Chip } from '@mui/material';
import {
  WaterDrop,
  AdminPanelSettings,
  EditLocationAlt,
  Engineering,
} from '@mui/icons-material';
import { useAppStore, USERS } from '../store/useAppStore';

const Login = () => {
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <AdminPanelSettings sx={{ fontSize: 32, color: '#f43f5e' }} />;
      case 'Editor':
        return <EditLocationAlt sx={{ fontSize: 32, color: '#0ea5e9' }} />;
      case 'Operator':
        return <Engineering sx={{ fontSize: 32, color: '#10b981' }} />;
      default:
        return <WaterDrop sx={{ fontSize: 32 }} />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'Review and approve/reject proposed network updates, audit trail logging, and verify operational submissions.';
      case 'Editor':
        return 'Draft network topology amendments, add elements, simulate pipe splits, and assign verification tasks.';
      case 'Operator':
        return 'Review assigned field inspection targets, inspect on-site structures, write reports, and post observations.';
      default:
        return '';
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #075985 0%, #0f172a 100%)',
        p: 2,
      }}
    >
      <Paper
        sx={{
          p: 4.5,
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0px 20px 48px rgba(0, 0, 0, 0.4)',
          bgcolor: 'background.paper',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 3,
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" mb={1} gap={0.5}>
          <WaterDrop sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight="bold" sx={{ letterSpacing: 0.5 }}>
            SmartTerra
          </Typography>
        </Box>
        <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
          Water Network Editor
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={4}>
          Identify yourself by choosing an account profile below to login:
        </Typography>

        <Stack spacing={2.5}>
          {USERS.map((user) => (
            <Card
              key={user.id}
              variant="outlined"
              sx={{
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  borderColor: user.role === 'Admin' ? '#f43f5e' : user.role === 'Editor' ? '#0ea5e9' : '#10b981',
                },
              }}
            >
              <CardActionArea onClick={() => setCurrentUser(user)}>
                <CardContent sx={{ p: 2.2, display: 'flex', alignItems: 'flex-start', gap: 2, textAlign: 'left' }}>
                  <Box sx={{ mt: 0.5 }}>{getRoleIcon(user.role)}</Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      {user.name}{' '}
                      <Chip
                        label={user.role}
                        size="small"
                        color={user.role === 'Admin' ? 'error' : user.role === 'Editor' ? 'primary' : 'success'}
                        sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700 }}
                      />
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.8, lineHeight: 1.3 }}>
                      {getRoleDescription(user.role)}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

export default Login;
