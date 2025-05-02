import React, { useEffect, useState } from "react";
import axios from "axios";

const Statistics = () => {
  const [stats, setStats] = useState({ revenuePerDay: 0, totalRides: 0 });

  useEffect(() => {
    axios.get("/api/stats").then((res) => setStats(res.data));
  }, []);

  return (
    <div className="card p-4">
      <h3>System Statistics</h3>
      <p>
        <strong>Revenue/Day:</strong> ${stats.revenuePerDay}
      </p>
      <p>
        <strong>Total Rides (Area-wise):</strong> {stats.totalRides}
      </p>
    </div>
  );
};

export default Statistics;
