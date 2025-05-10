import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../store/slices/authSlice";

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
    <div className="container mt-4">
      <h2>Admin Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={login}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>
        <button className="btn btn-success" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
