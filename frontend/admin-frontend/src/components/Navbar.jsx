import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import "../styles/common.css";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav
      style={{
        backgroundColor: "var(--uber-black)",
        padding: "1rem 0",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div
        className="admin-container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          to="/"
          style={{
            color: "var(--uber-white)",
            textDecoration: "none",
            fontSize: "1.5rem",
            fontWeight: "600",
          }}
        >
          Uber Admin
        </Link>

        {isAuthenticated && (
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <Link
                to="/add-driver"
                style={{ color: "var(--uber-white)", textDecoration: "none" }}
              >
                Add Driver
              </Link>
              <Link
                to="/add-customer"
                style={{ color: "var(--uber-white)", textDecoration: "none" }}
              >
                Add Customer
              </Link>
              <Link
                to="/review-accounts"
                style={{ color: "var(--uber-white)", textDecoration: "none" }}
              >
                Review Accounts
              </Link>
              <Link
                to="/statistics"
                style={{ color: "var(--uber-white)", textDecoration: "none" }}
              >
                Statistics
              </Link>
              <Link
                to="/charts"
                style={{ color: "var(--uber-white)", textDecoration: "none" }}
              >
                Charts
              </Link>
              <Link
                to="/search-bill"
                style={{ color: "var(--uber-white)", textDecoration: "none" }}
              >
                Search Bill
              </Link>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ color: "var(--uber-white)" }}>
                {user?.name || "Admin"}
              </span>
              <button
                onClick={handleLogout}
                className="admin-button"
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid var(--uber-white)",
                  padding: "0.5rem 1rem",
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
