import { Link } from 'react-router-dom';
import { IfFeatureEnabled } from '../../components/if-feature-enabled';

const SignInPage = () => (
  <div>
    <h1>Sign In</h1>
    <IfFeatureEnabled featureKey="PEER-567-sign-in-with-google">
      <button>Sign In with Google</button>
    </IfFeatureEnabled>
    <Link to="/">Click here to go back to root page.</Link>
  </div>
);

export default SignInPage;
