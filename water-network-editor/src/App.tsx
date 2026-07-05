import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { useAppStore } from './store/useAppStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

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
        {currentUser ? <Dashboard /> : <Login />}
      </Box>
    </ThemeProvider>
  );
}

export default App;
