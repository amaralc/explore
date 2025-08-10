import { useAuth } from 'react-oidc-context';
import { Link, Outlet } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  console.log(user);

  return (
    <div>
      <h2>Dashboard</h2>
      <nav>
        <ul>
          <li>
            <Link to="profile">Profile</Link>
          </li>
          <li>
            <Link to="settings">Settings</Link>
          </li>
        </ul>
      </nav>
      <hr />
      <div className="user">
        <h2>Welcome, {user.profile.name}!</h2>
        <p className="description">Your ZITADEL Profile Information</p>
        <p>Name: {user.profile.name}</p>
        <p>Email: {user.profile.email}</p>
        <p>Email Verified: {user.profile.email_verified ? 'Yes' : 'No'}</p>
        <p>Roles: {JSON.stringify(user.profile['urn:zitadel:iam:org:project:roles'])}</p>
      </div>
      <Outlet />
    </div>
  );
};
