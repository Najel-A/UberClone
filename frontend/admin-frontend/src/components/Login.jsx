import React, { useState } from "react";
import axios from "axios";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:3002/api/admin/login",
        { email, password }
      );
      localStorage.setItem("admin_token", data.token);
      onLogin?.(); // optional callback
    } catch {
      alert("Invalid login credentials");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Admin Login</h2>
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
        <button className="btn btn-success">Login</button>
      </form>
    </div>
  );
}
