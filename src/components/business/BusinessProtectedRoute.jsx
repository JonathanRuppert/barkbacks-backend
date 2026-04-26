import { Navigate, useLocation } from 'react-router-dom';
import { useBusinessAuth } from '../../contexts/BusinessAuthContext';

function BusinessProtectedRoute({ children }) {
  const { isAuthenticated } = useBusinessAuth();
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/business/login" replace state={{ from: location }} />;
  }

  return children;
}

export default BusinessProtectedRoute;
