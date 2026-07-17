import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequireMaster({ children }) {
  const { session } = useAuth();
  if (!session || session.role !== 'master') return <Navigate to="/login" replace />;
  return children;
}

export function RequireClient({ children }) {
  const { session } = useAuth();
  if (!session || session.role !== 'client') return <Navigate to="/login" replace />;
  return children;
}

export function RequireEmployee({ children }) {
  const { session } = useAuth();
  if (!session || session.role !== 'employee') return <Navigate to="/login" replace />;
  return children;
}
