import { useAuth } from 'react-oidc-context';
import { Link, Outlet } from 'react-router-dom';

export const Layout = () => {
  const auth = useAuth();

  return (
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
  );
};
