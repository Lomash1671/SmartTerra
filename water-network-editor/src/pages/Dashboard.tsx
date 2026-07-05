import { useState } from 'react';
import { Box, Drawer, Toolbar, Typography, AppBar, IconButton, Divider } from '@mui/material';
import { Logout, Menu } from '@mui/icons-material';
import { useAppStore } from '../store/useAppStore';
import Sidebar from '../components/Sidebar';
import MapWidget from '../components/MapWidget';
import PropertyPanel from '../components/PropertyPanel';
import TaskPanel from '../components/TaskPanel';
import ApprovalPanel from '../components/ApprovalPanel';
import HistoryPanel from '../components/HistoryPanel';
import { NetworkElement } from '../types';

export type ActivePanel = 'properties' | 'tasks' | 'approvals' | 'history' | null;

const drawerWidth = 280;

const Dashboard = () => {
  const { currentUser, setCurrentUser } = useAppStore();
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [selectedElement, setSelectedElement] = useState<NetworkElement | null>(null);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const renderPanelInfo = () => {
    switch (activePanel) {
      case 'properties':
        return <PropertyPanel element={selectedElement} onClose={() => setActivePanel(null)} />;
      case 'tasks':
        return <TaskPanel />;
      case 'approvals':
        return <ApprovalPanel />;
      case 'history':
        return <HistoryPanel />;
      default:
        return (
          <Box p={3}>
            <Typography variant="body1" color="text.secondary">
              Select an item from the sidebar or map to view details.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#ffffff', color: 'text.primary', boxShadow: 1 }}>
        <Toolbar variant="dense">
          <Menu sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Water Network Editor
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, fontWeight: 500 }}>
            {currentUser?.name}
          </Typography>
          <IconButton onClick={handleLogout} color="error" size="small">
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar variant="dense" />
        <Sidebar activePanel={activePanel} setActivePanel={setActivePanel} />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 0, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Toolbar variant="dense" sx={{ minHeight: '48px !important' }} />
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Map Area */}
          <Box sx={{ flexGrow: 1, position: 'relative' }}>
            <MapWidget 
              onElementSelect={(elem) => {
                setSelectedElement(elem);
                setActivePanel('properties');
              }} 
            />
          </Box>
          
          {/* Right Panel */}
          {activePanel && (
            <>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ width: 400, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', boxShadow: -2, zIndex: 10 }}>
                {renderPanelInfo()}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
