import { Navigate, Outlet } from 'react-router';
import { useUser } from '../features/auth/authService';
import { AuthorizedLayout } from './AuthorizedLayout';

export const ProtectedRoutesOutlet = () => {
  const { isAuthenticated } = useUser();

  return isAuthenticated ? (
    <AuthorizedLayout>
      <Outlet />
    </AuthorizedLayout>
  ) : (
    <Navigate to="/login" />
  );
};
