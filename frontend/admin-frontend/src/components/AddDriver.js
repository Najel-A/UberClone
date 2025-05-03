import React, { useState } from "react";
import axios from "axios";

const VALID_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const AddDriver = () => {
  const [form, setForm] = useState({
    driverId: "",
    firstName: "",
    lastName: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    phoneNumber: "",
    email: "",
    carDetails: "",
    rating: "",
    reviews: "",
    introVideo: "",
    introImages: [],
    ridesHistory: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setForm({ ...form, introImages: urls });
  };

  const isValidState = (state) => VALID_STATES.includes(state);
  const isValidZip = (zip) => /^\d{5}(-\d{4})?$/.test(zip);
  const isValidSSN = (ssn) => /^\d{3}-\d{2}-\d{4}$/.test(ssn);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { driverId, address } = form;

    if (!isValidSSN(driverId)) {
      alert("Invalid Driver ID (must be in SSN format XXX-XX-XXXX)");
      return;
    }

    if (!isValidState(address.state)) {
      alert(
        "Invalid state. Must be a valid US state abbreviation or full name."
      );
      return;
    }

    if (!isValidZip(address.zipCode)) {
      alert("Invalid ZIP code format.");
      return;
    }

    try {
      await axios.post("http://localhost:3002/api/admin/drivers", form);
      alert("Driver added successfully!");
    } catch (error) {
      alert("Error adding driver");
    }
  };

  return (
    <div className="card p-4">
      <h3 className="mb-4">Add New Driver</h3>
      <form onSubmit={handleSubmit}>
        <input
          name="driverId"
          placeholder="Driver ID (SSN)"
          className="form-control mb-2"
          onChange={handleChange}
        />
        <input
          name="firstName"
          placeholder="First Name"
          className="form-control mb-2"
          onChange={handleChange}
        />
        <input
          name="lastName"
          placeholder="Last Name"
          className="form-control mb-2"
          onChange={handleChange}
        />
        <input
          name="address.street"
          placeholder="Street"
          className="form-control mb-2"
          onChange={handleChange}
        />
        <input
          name="address.city"
          placeholder="City"
          className="form-control mb-2"
          onChange={handleChange}
        />
        <input
          name="address.state"
          placeholder="State (abbr. or full name)"
          className="form-control mb-2"
          onChange={handleChange}
        />
        <input
          name="address.zipCode"
          placeholder="Zip Code"
          className="form-control mb-2"
          onChange={handleChange}
        />
        <input
          name="phoneNumber"
          placeholder="Phone Number"
          className="form-control mb-2"
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          className="form-control mb-2"
          onChange={handleChange}
        />
        <input
          name="carDetails"
          placeholder="Car Details"
          className="form-control mb-2"
          onChange={handleChange}
        />
        <input
          name="introVideo"
          placeholder="Intro Video URL"
          className="form-control mb-2"
          onChange={handleChange}
        />
        <input
          type="file"
          multiple
          accept="image/*"
          className="form-control mb-2"
          onChange={handleImageChange}
        />
        <button type="submit" className="btn btn-primary">
          Add Driver
        </button>
      </form>
    </div>
  );
};

export default AddDriver;
