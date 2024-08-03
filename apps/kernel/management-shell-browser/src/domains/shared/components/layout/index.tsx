import { Link, Outlet } from 'react-router-dom';

export const Layout = () => (
  <div>
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="dashboard">Dashboard</Link>
        </li>
      </ul>
    </nav>
    <hr />
    <Outlet />
  </div>
);
