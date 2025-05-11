import { createSlice, createSelector } from "@reduxjs/toolkit";

const initialState = {
  drivers: [],
  customers: [],
  loading: false,
  error: null,
  searchParams: {
    drivers: {
      firstName: "",
      lastName: "",
      city: "",
      state: "",
      zipCode: "",
      phoneNumber: "",
      email: "",
      carMake: "",
      carModel: "",
      carYear: "",
      minRating: "",
    },
    customers: {
      firstName: "",
      lastName: "",
      city: "",
      state: "",
      zipCode: "",
      phoneNumber: "",
      email: "",
    },
  },
};

export const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    setDrivers: (state, action) => {
      state.drivers = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCustomers: (state, action) => {
      state.customers = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateDriverSearchParams: (state, action) => {
      state.searchParams.drivers = {
        ...state.searchParams.drivers,
        ...action.payload,
      };
    },
    updateCustomerSearchParams: (state, action) => {
      state.searchParams.customers = {
        ...state.searchParams.customers,
        ...action.payload,
      };
    },
    resetDriverSearch: (state) => {
      state.searchParams.drivers = initialState.searchParams.drivers;
    },
    resetCustomerSearch: (state) => {
      state.searchParams.customers = initialState.searchParams.customers;
    },
    updateDriver: (state, action) => {
      const index = state.drivers.findIndex(
        (driver) => driver._id === action.payload._id
      );
      if (index !== -1) {
        state.drivers[index] = action.payload;
      }
    },
    updateCustomer: (state, action) => {
      const index = state.customers.findIndex(
        (customer) => customer._id === action.payload._id
      );
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
    },
    deleteDriver: (state, action) => {
      state.drivers = state.drivers.filter(
        (driver) => driver._id !== action.payload
      );
    },
    deleteCustomer: (state, action) => {
      state.customers = state.customers.filter(
        (customer) => customer._id !== action.payload
      );
    },
  },
});

// Selectors
export const selectFilteredDrivers = createSelector(
  [
    (state) => state.accounts.drivers,
    (state) => state.accounts.searchParams.drivers,
  ],
  (drivers, searchParams) => {
    return drivers.filter((driver) => {
      // Helper function to check if a string matches the search term
      const matchesSearch = (value, searchTerm) => {
        if (!searchTerm) return true;
        return value?.toLowerCase().includes(searchTerm.toLowerCase());
      };

      // Helper function to check if a number matches the search term
      const matchesNumber = (value, searchTerm) => {
        if (!searchTerm) return true;
        return value >= parseFloat(searchTerm);
      };

      return (
        matchesSearch(driver.firstName, searchParams.firstName) &&
        matchesSearch(driver.lastName, searchParams.lastName) &&
        matchesSearch(driver.email, searchParams.email) &&
        matchesSearch(driver.phoneNumber, searchParams.phoneNumber) &&
        matchesSearch(driver.address?.city, searchParams.city) &&
        matchesSearch(driver.address?.state, searchParams.state) &&
        matchesSearch(driver.address?.zipCode, searchParams.zipCode) &&
        matchesSearch(driver.carDetails?.make, searchParams.carMake) &&
        matchesSearch(driver.carDetails?.model, searchParams.carModel) &&
        (!searchParams.carYear ||
          driver.carDetails?.year === parseInt(searchParams.carYear)) &&
        (!searchParams.minRating ||
          (driver.rating &&
            driver.rating >= parseFloat(searchParams.minRating)))
      );
    });
  }
);

export const selectFilteredCustomers = createSelector(
  [
    (state) => state.accounts.customers,
    (state) => state.accounts.searchParams.customers,
  ],
  (customers, searchParams) => {
    return customers.filter((customer) => {
      // Helper function to check if a string matches the search term
      const matchesSearch = (value, searchTerm) => {
        if (!searchTerm) return true;
        return value?.toLowerCase().includes(searchTerm.toLowerCase());
      };

      return (
        matchesSearch(customer.firstName, searchParams.firstName) &&
        matchesSearch(customer.lastName, searchParams.lastName) &&
        matchesSearch(customer.email, searchParams.email) &&
        matchesSearch(customer.phoneNumber, searchParams.phoneNumber) &&
        matchesSearch(customer.address?.city, searchParams.city) &&
        matchesSearch(customer.address?.state, searchParams.state) &&
        matchesSearch(customer.address?.zipCode, searchParams.zipCode)
      );
    });
  }
);

export const {
  setDrivers,
  setCustomers,
  setLoading,
  setError,
  updateDriverSearchParams,
  updateCustomerSearchParams,
  resetDriverSearch,
  resetCustomerSearch,
  updateDriver,
  updateCustomer,
  deleteDriver,
  deleteCustomer,
} = accountsSlice.actions;

export default accountsSlice.reducer;
