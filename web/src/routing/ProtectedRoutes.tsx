import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../features/auth/authService';
import { AuthorizedLayout } from './AuthorizedLayout';

export const ProtectedRoutesOutlet = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null) {
    return <div />;
  }

  return isAuthenticated ? (
    <AuthorizedLayout>
      <Outlet />
    </AuthorizedLayout>
  ) : (
    <Navigate to="/login" />
  );
};
