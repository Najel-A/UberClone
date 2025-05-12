import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentDriver } from "./redux/slices/authSlice";
import Navbar from "./components/Navbar";
import CreateDriver from "./components/CreateDriver";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import UpdateDriver from "./components/UpdateDriver";
import DriverInfo from "./components/DriverInfo";
import DriverIntroVideo from "./components/DriverIntroVideo";
import Simulation from './Simulation';
import DriverRideHistory from "./components/DriverRideHistory";
import "./App.css";

// Protected route component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div className="text-center p-5">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const dispatch = useDispatch();
  const { driverId, token } = useSelector((state) => state.auth);

  // Check authentication on app load
  useEffect(() => {
    if (driverId && token) {
      dispatch(fetchCurrentDriver(driverId));
    }
  }, [dispatch, driverId, token]);

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <div className="flex-grow-1">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<CreateDriver />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <DriverInfo />
                </PrivateRoute>
              }
            />
            <Route
              path="/update-profile"
              element={
                <PrivateRoute>
                  <UpdateDriver />
                </PrivateRoute>
              }
            />
            <Route
              path="/intro-video"
              element={
                <PrivateRoute>
                  <DriverIntroVideo />
                </PrivateRoute>
              }
            />
            <Route
              path="/simulation"
              element={
                <PrivateRoute>
                  <Simulation />
                </PrivateRoute>
              }
            />
            <Route
              path="/ride-history"
              element={
                <PrivateRoute>
                  <DriverRideHistory />
                </PrivateRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
        <footer className="text-center py-3 mt-auto">
          <div className="container">
            <span className="text-muted">
              © {new Date().getFullYear()} Uber Driver
            </span>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
