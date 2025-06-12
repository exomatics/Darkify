import { Navigate } from 'react-router';
import { useUser } from '../../features/auth/authService';

export const IndexPage = () => {
  const { isAuthenticated } = useUser();
  return isAuthenticated ? <Navigate to={'/home'} /> : <Navigate to={'/login'} />;
};
