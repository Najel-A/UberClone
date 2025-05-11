import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import RideInProgress from './pages/RideInProgress';
import RideHistory from './pages/RideHistory';

// Redux-based Protected Route component
const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.user.user);
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

// Redux-based Public Route component
const PublicRoute = ({ children }) => {
  const user = useSelector((state) => state.user.user);
  if (user) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips"
        element={
          <ProtectedRoute>
            <Trips />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ride-in-progress"
        element={
          <ProtectedRoute>
            <RideInProgress />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ride-history"
        element={
          <ProtectedRoute>
            <RideHistory />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes; 