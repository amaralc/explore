import { Link } from 'react-router-dom';

export const NavigationBar = () => {
  return (
    <div role="navigation">
      <h1>Navigation</h1>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/cladogram">Visualize Cladogram</Link>
        </li>
      </ul>
    </div>
  );
};
