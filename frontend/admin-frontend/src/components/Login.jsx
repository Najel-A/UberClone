import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../store/slices/authSlice";
import "../styles/common.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const login = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const { data } = await axios.post(
        process.env.REACT_APP_ADMIN_BACKEND_PORT_URL + "/api/admin/login",
        { email, password }
      );
      localStorage.setItem("admin_token", data.token);
      dispatch(loginSuccess(data.admin));
      navigate("/review-accounts");
    } catch (error) {
      dispatch(
        loginFailure(
          error.response?.data?.message || "Invalid login credentials"
        )
      );
    }
  };

  return (
    <div className="admin-container">
      <div
        className="admin-card"
        style={{ maxWidth: "400px", margin: "4rem auto" }}
      >
        <h1
          className="admin-title"
          style={{ textAlign: "center", marginBottom: "2rem" }}
        >
          Admin Dashboard
        </h1>
        {error && (
          <div
            className="admin-badge admin-badge-error"
            style={{ marginBottom: "1rem" }}
          >
            {error}
          </div>
        )}
        <form onSubmit={login}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              Email
            </label>
            <input
              className="admin-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div style={{ marginBottom: "2rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              Password
            </label>
            <input
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            className="admin-button admin-button-success"
            type="submit"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <p style={{ margin: "0", color: "#666" }}>
              Don't have an account?{" "}
              <a
                href="/signup"
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                Sign up here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
