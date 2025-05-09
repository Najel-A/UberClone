import React, { useState } from "react";

const SearchDriver = () => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    console.log("Searching for driver:", query);
    // GET request with search query to backend here
  };

  return (
    <div>
      <h2>Search Driver</h2>
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Search by name or address"
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch} className="btn btn-info">
        Search
      </button>
    </div>
  );
};

export default SearchDriver;
