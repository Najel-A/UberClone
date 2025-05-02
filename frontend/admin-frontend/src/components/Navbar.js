import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
    <div className="container">
      <Link className="navbar-brand" to="/">
        Admin Panel
      </Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
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
        </ul>
      </div>
    </div>
  </nav>
);

export default Navbar;
