import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("adminToken");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Admin Panel
        </Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {isLoggedIn && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/add-driver">
                    Add Driver
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/add-customer">
                    Add Customer
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/review-accounts">
                    Review Accounts
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/statistics">
                    Statistics
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/charts">
                    Charts
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/search-bill">
                    Search Bill
                  </Link>
                </li>
              </>
            )}
          </ul>
          <ul className="navbar-nav ms-auto">
            {!isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/signup">
                    Signup
                  </Link>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <button
                  onClick={handleLogout}
                  className="btn btn-sm btn-outline-light"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
