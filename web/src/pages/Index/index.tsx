import { Navigate } from 'react-router';
import { useAuth } from '../../features/auth/authService';

export const IndexPage = () => {
  const { isAuthenticated } = useAuth();
  console.log(isAuthenticated);
  return isAuthenticated ? <Navigate to={'/home'} /> : <Navigate to={'/login'} />;
};
