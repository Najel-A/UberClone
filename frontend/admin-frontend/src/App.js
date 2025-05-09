import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import AddDriver from "./components/AddDriver";
import AddCustomer from "./components/AddCustomer";
import ReviewAccounts from "./components/ReviewAccounts";
import Statistics from "./components/Statistics";
import Charts from "./components/Charts";
import SearchBill from "./components/SearchBill";
import BillDetails from "./components/BillDetails";
import Signup from "./components/Signup";
import Login from "./components/Login";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/add-driver" element={<AddDriver />} />
          <Route path="/add-customer" element={<AddCustomer />} />
          <Route path="/review-accounts" element={<ReviewAccounts />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/search-bill" element={<SearchBill />} />
          <Route path="/bill/:id" element={<BillDetails />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
