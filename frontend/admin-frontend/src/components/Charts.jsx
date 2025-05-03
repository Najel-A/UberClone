import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import ProtectedRoute from "./ProtectedRoute";

const Charts = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("/api/chart-data").then((res) => setData(res.data));
  }, []);

  const chartData = {
    labels: data.map((d) => d.area),
    datasets: [
      {
        label: "Rides Per Area",
        data: data.map((d) => d.rides),
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  return (
    <div className="card p-4">
      <h3>Ride Distribution by Area</h3>
      <Bar data={chartData} />
    </div>
  );
};

export default Charts;
