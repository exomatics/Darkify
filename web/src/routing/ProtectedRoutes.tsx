import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../features/auth/authService';
import { AuthorizedLayout } from './AuthorizedLayout';

export const ProtectedRoutesOutlet = () => {
  const { currentUser } = useAuth();

  return currentUser ? (
    <AuthorizedLayout>
      <Outlet />
    </AuthorizedLayout>
  ) : (
    <Navigate to="/login" />
  );
};
