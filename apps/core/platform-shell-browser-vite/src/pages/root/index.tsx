import { Link } from 'react-router-dom';
import { withAuthGuard } from '../../hocs/with-auth-guard';

const RootPage = () => (
  <div>
    <h1>Root Page</h1>
    This is the generated root route. <Link to="/page-2">Click here for page 2.</Link>
  </div>
);

export default withAuthGuard(RootPage);
