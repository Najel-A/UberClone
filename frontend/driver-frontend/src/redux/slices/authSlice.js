import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import driverService from "../../services/api";

// Async thunk for login
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await driverService.login(email, password);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

// Async thunk for fetching current driver data
export const fetchCurrentDriver = createAsyncThunk(
  "auth/fetchCurrentDriver",
  async (id, { rejectWithValue }) => {
    try {
      const response = await driverService.getDriver(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch driver data"
      );
    }
  }
);

// Async thunk for logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await driverService.logout();
      return null;
    } catch (err) {
      console.error("Logout error:", err);
      // Even if logout API fails, we still want to clear local state
      return null;
    }
  }
);

const initialState = {
  currentDriver: null,
  token: localStorage.getItem("driverToken"),
  driverId: localStorage.getItem("driverId"),
  loading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    checkAuth: (state) => {
      state.isAuthenticated = !!state.currentDriver;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDriver = action.payload;
        state.token = action.payload.token;
        state.driverId = action.payload.id;
        state.isAuthenticated = true;

        // Update localStorage
        localStorage.setItem("driverToken", action.payload.token);
        localStorage.setItem("driverId", action.payload.id);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
        state.isAuthenticated = false;
      })

      // Fetch current driver cases
      .addCase(fetchCurrentDriver.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDriver = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        // Clear invalid tokens
        localStorage.removeItem("driverToken");
        localStorage.removeItem("driverId");
        state.token = null;
        state.driverId = null;
      })

      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.currentDriver = null;
        state.token = null;
        state.driverId = null;
        state.isAuthenticated = false;

        // Clear localStorage
        localStorage.removeItem("driverToken");
        localStorage.removeItem("driverId");
      });
  },
});

export const { clearError, checkAuth } = authSlice.actions;

export default authSlice.reducer;
