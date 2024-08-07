import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useAuth } from 'react-oidc-context';
import { Link, Outlet } from 'react-router-dom';

export default function DenseAppBar() {
  const auth = useAuth();
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="inherit" component="div">
            Photos
          </Typography>
          <div>
            <nav>
              <ul>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="workspaces">Workspaces Dashboard</Link>
                </li>
                {auth.isAuthenticated && <button onClick={() => auth.removeUser()}>Log out</button>}
              </ul>
            </nav>
            <hr />
            <Outlet />
          </div>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
