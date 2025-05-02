import React, { useState } from "react";
import axios from "axios";

const SearchBill = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const res = await axios.get(`/api/bills/search?q=${query}`);
    setResult(res.data);
  };

  return (
    <div className="card p-4">
      <h3>Search Bill</h3>
      <form onSubmit={handleSearch}>
        <input
          className="form-control mb-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by ID, customer, etc."
        />
        <button className="btn btn-primary">Search</button>
      </form>
      {result && (
        <div className="mt-3">
          <p>
            <strong>ID:</strong> {result.id}
          </p>
          <p>
            <strong>Customer:</strong> {result.customer}
          </p>
          <p>
            <strong>Amount:</strong> ${result.amount}
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchBill;
