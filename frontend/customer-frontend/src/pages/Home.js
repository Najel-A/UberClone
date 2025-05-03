import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/auth.css';

const Home = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome to UBER</h2>
        <p className="text-center text-muted mb-4">
          Your reliable ride-hailing service
        </p>

        <div className="row g-4">
          <div className="col-12 col-sm-6">
            <Link to="/login" className="btn btn-primary auth-button d-block">
              Login as Customer
            </Link>
          </div>
          <div className="col-12 col-sm-6">
            <Link to="/signup" className="btn btn-primary auth-button d-block">
              Sign Up as Customer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 