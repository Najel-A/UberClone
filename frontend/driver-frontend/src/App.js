import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import CreateDriver from "./components/CreateDriver";
import DeleteDriver from "./components/DeleteDriver";
import ListDrivers from "./components/ListDrivers";
import UpdateDriver from "./components/UpdateDriver";
import SearchDriver from "./components/SearchDriver";
import DriverInfo from "./components/DriverInfo";
import DriverIntroVideo from "./components/DriverIntroVideo";

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/create" element={<CreateDriver />} />
          <Route path="/delete" element={<DeleteDriver />} />
          <Route path="/list" element={<ListDrivers />} />
          <Route path="/update" element={<UpdateDriver />} />
          <Route path="/search" element={<SearchDriver />} />
          <Route path="/info" element={<DriverInfo />} />
          <Route path="/intro" element={<DriverIntroVideo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
