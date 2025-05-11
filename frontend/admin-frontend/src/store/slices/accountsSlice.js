import { createSlice, createSelector } from "@reduxjs/toolkit";
import { createSelectorCreator, lruMemoize } from "reselect";
import isEqual from "lodash/isEqual";

// Create a custom selector creator that uses deep equality comparison
const createDeepEqualSelector = createSelectorCreator(lruMemoize, isEqual);

// Memoized helper functions for search matching
const createSearchMatcher = () => {
  const cache = new Map();

  return (value, searchTerm) => {
    if (!searchTerm) return true;

    const cacheKey = `${value}-${searchTerm}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const result = value?.toLowerCase().includes(searchTerm.toLowerCase());
    cache.set(cacheKey, result);
    return result;
  };
};

const createNumberMatcher = () => {
  const cache = new Map();

  return (value, searchTerm) => {
    if (!searchTerm) return true;

    const cacheKey = `${value}-${searchTerm}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const result = value >= parseFloat(searchTerm);
    cache.set(cacheKey, result);
    return result;
  };
};

// Define search params separately
const defaultSearchParams = {
  drivers: {
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
    email: "",
    carMake: "",
    carModel: "",
    carYear: "",
    minRating: "",
    status: "",
    latitude: "",
    longitude: "",
    hasVideo: "",
    hasImages: "",
  },
  customers: {
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
    email: "",
    minRating: "",
    hasCreditCard: "",
  },
};

const initialState = {
  drivers: [],
  customers: [],
  loading: false,
  error: null,
  searchParams: defaultSearchParams,
  debouncedSearchParams: defaultSearchParams,
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
    // Add new reducers for debounced search params
    updateDebouncedDriverSearchParams: (state, action) => {
      state.debouncedSearchParams.drivers = {
        ...state.debouncedSearchParams.drivers,
        ...action.payload,
      };
    },
    updateDebouncedCustomerSearchParams: (state, action) => {
      state.debouncedSearchParams.customers = {
        ...state.debouncedSearchParams.customers,
        ...action.payload,
      };
    },
    resetDriverSearch: (state) => {
      state.searchParams.drivers = initialState.searchParams.drivers;
      state.debouncedSearchParams.drivers = initialState.searchParams.drivers;
    },
    resetCustomerSearch: (state) => {
      state.searchParams.customers = initialState.searchParams.customers;
      state.debouncedSearchParams.customers =
        initialState.searchParams.customers;
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

// Memoized selectors for filtered data
export const selectFilteredDrivers = createDeepEqualSelector(
  [
    (state) => state.accounts.drivers,
    (state) => state.accounts.debouncedSearchParams.drivers,
  ],
  (drivers, searchParams) => {
    const matchesSearch = createSearchMatcher();
    const matchesNumber = createNumberMatcher();

    // Create a cache for the filtered results
    const cacheKey = JSON.stringify(searchParams);
    const cachedResults = new Map();

    if (cachedResults.has(cacheKey)) {
      return cachedResults.get(cacheKey);
    }

    const filtered = drivers.filter((driver) => {
      // Quick return if no search params are active
      if (Object.values(searchParams).every((value) => !value)) {
        return true;
      }

      return (
        matchesSearch(driver.firstName, searchParams.firstName) &&
        matchesSearch(driver.lastName, searchParams.lastName) &&
        matchesSearch(driver.email, searchParams.email) &&
        matchesSearch(driver.phoneNumber, searchParams.phoneNumber) &&
        matchesSearch(driver.address?.street, searchParams.street) &&
        matchesSearch(driver.address?.city, searchParams.city) &&
        matchesSearch(driver.address?.state, searchParams.state) &&
        matchesSearch(driver.address?.zipCode, searchParams.zipCode) &&
        matchesSearch(driver.carDetails?.make, searchParams.carMake) &&
        matchesSearch(driver.carDetails?.model, searchParams.carModel) &&
        (!searchParams.carYear ||
          driver.carDetails?.year === parseInt(searchParams.carYear)) &&
        (!searchParams.minRating ||
          (driver.rating &&
            matchesNumber(driver.rating, searchParams.minRating))) &&
        (!searchParams.status || driver.status === searchParams.status) &&
        (!searchParams.latitude ||
          (driver.currentLocation?.latitude &&
            matchesNumber(
              driver.currentLocation.latitude,
              searchParams.latitude
            ))) &&
        (!searchParams.longitude ||
          (driver.currentLocation?.longitude &&
            matchesNumber(
              driver.currentLocation.longitude,
              searchParams.longitude
            ))) &&
        (!searchParams.hasVideo ||
          (searchParams.hasVideo === "true" &&
            driver.introductionMedia?.video) ||
          (searchParams.hasVideo === "false" &&
            !driver.introductionMedia?.video)) &&
        (!searchParams.hasImages ||
          (searchParams.hasImages === "true" &&
            driver.introductionMedia?.images?.length > 0) ||
          (searchParams.hasImages === "false" &&
            (!driver.introductionMedia?.images ||
              driver.introductionMedia.images.length === 0)))
      );
    });

    cachedResults.set(cacheKey, filtered);
    return filtered;
  }
);

export const selectFilteredCustomers = createDeepEqualSelector(
  [
    (state) => state.accounts.customers,
    (state) => state.accounts.debouncedSearchParams.customers,
  ],
  (customers, searchParams) => {
    const matchesSearch = createSearchMatcher();
    const matchesNumber = createNumberMatcher();

    // Create a cache for the filtered results
    const cacheKey = JSON.stringify(searchParams);
    const cachedResults = new Map();

    if (cachedResults.has(cacheKey)) {
      return cachedResults.get(cacheKey);
    }

    const filtered = customers.filter((customer) => {
      // Quick return if no search params are active
      if (Object.values(searchParams).every((value) => !value)) {
        return true;
      }

      return (
        matchesSearch(customer.firstName, searchParams.firstName) &&
        matchesSearch(customer.lastName, searchParams.lastName) &&
        matchesSearch(customer.email, searchParams.email) &&
        matchesSearch(customer.phoneNumber, searchParams.phoneNumber) &&
        matchesSearch(customer.address?.street, searchParams.street) &&
        matchesSearch(customer.address?.city, searchParams.city) &&
        matchesSearch(customer.address?.state, searchParams.state) &&
        matchesSearch(customer.address?.zipCode, searchParams.zipCode) &&
        (!searchParams.minRating ||
          (customer.rating &&
            matchesNumber(customer.rating, searchParams.minRating))) &&
        (!searchParams.hasCreditCard ||
          (searchParams.hasCreditCard === "true" &&
            customer.creditCardDetails) ||
          (searchParams.hasCreditCard === "false" &&
            !customer.creditCardDetails))
      );
    });

    cachedResults.set(cacheKey, filtered);
    return filtered;
  }
);

export const {
  setDrivers,
  setCustomers,
  setLoading,
  setError,
  updateDriverSearchParams,
  updateCustomerSearchParams,
  updateDebouncedDriverSearchParams,
  updateDebouncedCustomerSearchParams,
  resetDriverSearch,
  resetCustomerSearch,
  updateDriver,
  updateCustomer,
  deleteDriver,
  deleteCustomer,
} = accountsSlice.actions;

export default accountsSlice.reducer;
