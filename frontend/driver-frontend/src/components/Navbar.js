import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Driver Dashboard
        </Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/create">
                Create
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/delete">
                Delete
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/list">
                List
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/update">
                Update
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/search">
                Search
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/info">
                Info
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/intro">
                Intro Video
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
