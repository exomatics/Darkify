import { Navigate } from 'react-router';
import { useUser } from '../../features/auth/authService';
import log from 'loglevel';

export const IndexPage = () => {
  const { isAuthenticated } = useUser();

  log.info('isAuthenticated is', isAuthenticated);

  return isAuthenticated ? <Navigate to={'/home'} /> : <Navigate to={'/login'} />;
};
