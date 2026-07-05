import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Assignment, CheckCircle, History, Map } from '@mui/icons-material';
import { ActivePanel } from '../pages/Dashboard';
import { useAppStore } from '../store/useAppStore';

interface SidebarProps {
  activePanel: ActivePanel;
  setActivePanel: (panel: ActivePanel) => void;
}

const Sidebar = ({ activePanel, setActivePanel }: SidebarProps) => {
  const currentUser = useAppStore(state => state.currentUser);
  if (!currentUser) return null;

  return (
    <List sx={{ mt: 1 }}>
      <ListItem disablePadding>
        <ListItemButton selected={activePanel === null} onClick={() => setActivePanel(null)}>
          <ListItemIcon><Map color="primary" /></ListItemIcon>
          <ListItemText primary="Map View" />
        </ListItemButton>
      </ListItem>
      
      <Divider sx={{ my: 1 }} />
      
      {(currentUser.role === 'Admin' || currentUser.role === 'Editor') && (
        <ListItem disablePadding>
          <ListItemButton selected={activePanel === 'approvals'} onClick={() => setActivePanel('approvals')}>
            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
            <ListItemText primary={currentUser.role === 'Admin' ? "Pending Approvals" : "My Drafts / Edits"} />
          </ListItemButton>
        </ListItem>
      )}

      {(currentUser.role === 'Operator' || currentUser.role === 'Editor' || currentUser.role === 'Admin') && (
        <ListItem disablePadding>
          <ListItemButton selected={activePanel === 'tasks'} onClick={() => setActivePanel('tasks')}>
            <ListItemIcon><Assignment color="warning" /></ListItemIcon>
            <ListItemText primary={currentUser.role === 'Operator' ? "My Tasks" : "Field Tasks"} />
          </ListItemButton>
        </ListItem>
      )}
      
      <Divider sx={{ my: 1 }} />
      
      <ListItem disablePadding>
        <ListItemButton selected={activePanel === 'history'} onClick={() => setActivePanel('history')}>
          <ListItemIcon><History color="action" /></ListItemIcon>
          <ListItemText primary="Audit History" />
        </ListItemButton>
      </ListItem>

    </List>
  );
};

export default Sidebar;
