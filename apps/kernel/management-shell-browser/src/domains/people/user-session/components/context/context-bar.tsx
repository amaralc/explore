import AdbIcon from '@mui/icons-material/Adb';
import { Stack } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { useAuth } from 'react-oidc-context';
import { Link, useNavigation } from 'react-router-dom';

const settings = ['Profile', 'Account', 'Dashboard'];

export const ContextBar: React.FC = () => {
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const auth = useAuth();
  const navigation = useNavigation();
  const pathName = navigation.location?.pathname || window.location.pathname;
  const isSignInPage = pathName === '/auth/sign-in';
  const showSignInButton = !auth.isAuthenticated && !isSignInPage;

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <Toolbar disableGutters sx={{ height: 64 }}>
      <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />

      <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />

      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
        {showSignInButton && (
          <Button component={Link} to="/auth/sign-in" sx={{ my: 2, color: 'white', display: 'block' }}>
            Login
          </Button>
        )}
      </Box>

      {auth.isAuthenticated && (
        <Stack direction={'row'} spacing={2} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' }}>
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            {settings.map((setting) => (
              <MenuItem key={setting} onClick={handleCloseUserMenu}>
                <Typography textAlign="center">{setting}</Typography>
              </MenuItem>
            ))}
            <MenuItem onClick={() => auth.removeUser()}>
              <Typography textAlign="center">Logout</Typography>
            </MenuItem>
          </Menu>
        </Stack>
      )}
    </Toolbar>
  );
};
