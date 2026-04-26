import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';

export default function CustomerProtectedRoute() {
  const { isAuthenticated } = useCustomerAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/app/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
