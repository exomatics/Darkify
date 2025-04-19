import { Navigate } from 'react-router';
import { useAuth } from '../../features/auth/authService';

export const IndexPage = () => {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to={'/home'} /> : <Navigate to={'/login'} />;
};
