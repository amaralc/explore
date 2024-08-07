import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import * as React from 'react';
import { useAuth } from 'react-oidc-context';
import { Link } from 'react-router-dom';

const pages = [
  {
    title: 'Overview',
    path: '/overview',
  },
  {
    title: 'Equipment',
    path: '/equipment',
  },
];

export const ContextNavigation: React.FC = () => {
  const auth = useAuth();
  const handleNavigate = () => {
    console.log('navigate');
  };

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <Toolbar
      disableGutters
      sx={{
        minHeight: {
          xs: 46,
        },
      }}
    >
      {pages.map((page) => (
        <Button
          key={page.title}
          component={Link}
          to={page.path}
          onClick={handleNavigate}
          sx={{ color: 'white' }}
          size="small"
        >
          {page.title}
        </Button>
      ))}
    </Toolbar>
  );
};
