import { lazy, Suspense } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress } from '@mui/material';
import { useAppStore } from './store/useAppStore';
import Login from './pages/Login';

// Lazy-load Dashboard so Leaflet + MUI heavy bundle is NOT downloaded
// until the user actually logs in. Keeps the Login page instant to load.
const Dashboard = lazy(() => import('./pages/Dashboard'));

const theme = createTheme({
  palette: {
    primary: {
      main: '#0ea5e9', // Water-themed blue
    },
    secondary: {
      main: '#f43f5e',
    },
    background: {
      default: '#f8fafc',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        }
      }
    }
  }
});

function App() {
  const currentUser = useAppStore(state => state.currentUser);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden' }}>
        {currentUser ? (
          <Suspense fallback={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
              <CircularProgress />
            </Box>
          }>
            <Dashboard />
          </Suspense>
        ) : <Login />}
      </Box>
    </ThemeProvider>
  );
}

export default App;
