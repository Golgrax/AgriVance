import { BrowserRouter, Routes, Route, Link, Outlet, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemText, Box, CssBaseline, Divider, ListItemIcon } from '@mui/material';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import LoginPage from './pages/LoginPage';
import PlanningPage from './pages/PlanningPage';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import AiAssistant from './components/AiAssistant';

//mga icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import SupplyChainPage from './pages/SupplyChainPage';

const AppLayout = () => {
  const drawerWidth = 240;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            AgriVance
          </Typography>
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
        <Toolbar />
        <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <List sx={{ flexGrow: 1 }}> {/* Main navigation list */}
            <ListItem disablePadding component={Link} to="/dashboard">
              <ListItemButton>
                <ListItemIcon><DashboardIcon /></ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding component={Link} to="/inventory">
              <ListItemButton>
                <ListItemIcon><InventoryIcon /></ListItemIcon>
                <ListItemText primary="Inventory" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding component={Link} to="/planning">
              <ListItemButton>
                <ListItemIcon><EventNoteIcon /></ListItemIcon>
                <ListItemText primary="Planning" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding component={Link} to="/supply-chain">
              <ListItemButton>
                <ListItemIcon><LocalShippingIcon /></ListItemIcon>
                <ListItemText primary="Supply Chain" />
              </ListItemButton>
            </ListItem>
          </List>
          
          <Box>
            <Divider />
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout}>
                  <ListItemIcon><LogoutIcon /></ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet /> 
      </Box>

      <AiAssistant />
    </Box>
  );
};

const ProtectedRoute = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return user ? <AppLayout /> : <Navigate to="/login" replace />;
};


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/planning" element={<PlanningPage />} />
          
          <Route path="/supply-chain" element={<SupplyChainPage />} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;