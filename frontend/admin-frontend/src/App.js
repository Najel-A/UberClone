import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import { store } from "./store/store";
import { loginSuccess } from "./store/slices/authSlice";
import Navbar from "./components/Navbar";
import Protected from "./components/ProtectedRoute";
import AddDriver from "./components/AddDriver";
import AddCustomer from "./components/AddCustomer";
import ReviewAccounts from "./components/ReviewAccounts";
import Statistics from "./components/Statistics";
import Charts from "./components/Charts";
import SearchBill from "./components/SearchBill";
import BillDetails from "./components/BillDetails";
import Signup from "./components/Signup";
import Login from "./components/Login";
import "./styles/common.css";

function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      // You might want to verify the token with your backend here
      dispatch(loginSuccess({ name: "Admin" })); // Replace with actual user data
    }
  }, [dispatch]);

  return (
    <Router>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--uber-light-gray)",
        }}
      >
        <Navbar />
        <div className="admin-container">
          <Routes>
            <Route
              path="/login"
              element={
                !isAuthenticated ? (
                  <Login />
                ) : (
                  <Navigate to="/review-accounts" />
                )
              }
            />
            <Route
              path="/signup"
              element={
                !isAuthenticated ? (
                  <Signup />
                ) : (
                  <Navigate to="/review-accounts" />
                )
              }
            />

            {/* Protected Routes */}
            <Route
              path="/add-driver"
              element={
                <Protected>
                  <AddDriver />
                </Protected>
              }
            />
            <Route
              path="/add-customer"
              element={
                <Protected>
                  <AddCustomer />
                </Protected>
              }
            />
            <Route
              path="/review-accounts"
              element={
                <Protected>
                  <ReviewAccounts />
                </Protected>
              }
            />
            <Route
              path="/statistics"
              element={
                <Protected>
                  <Statistics />
                </Protected>
              }
            />
            <Route
              path="/charts"
              element={
                <Protected>
                  <Charts />
                </Protected>
              }
            />
            <Route
              path="/search-bill"
              element={
                <Protected>
                  <SearchBill />
                </Protected>
              }
            />
            <Route
              path="/bill/:id"
              element={
                <Protected>
                  <BillDetails />
                </Protected>
              }
            />

            {/* Redirect root to review-accounts if authenticated, otherwise to login */}
            <Route
              path="/"
              element={
                <Navigate
                  to={isAuthenticated ? "/review-accounts" : "/login"}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
