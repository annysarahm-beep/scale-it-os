import { Navigate } from 'react-router-dom';
import { authService } from '../../services/auth/authService';

export function ProtectedRoute({ children }) {
  const isLoggedIn = authService.isLoggedIn();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function PublicRoute({ children }) {
  const isLoggedIn = authService.isLoggedIn();

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
