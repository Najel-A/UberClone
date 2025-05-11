import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import driverService from "../../services/api";

// Async thunk for updating driver status and location
export const updateDriverStatusAndLocation = createAsyncThunk(
  "driver/updateStatusAndLocation",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await driverService.updateDriverStatusAndLocation(
        id,
        data
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update status"
      );
    }
  }
);

// Async thunk for fetching driver video
export const fetchDriverVideo = createAsyncThunk(
  "driver/fetchVideo",
  async (id, { rejectWithValue }) => {
    try {
      const response = await driverService.getDriverVideo(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch video"
      );
    }
  }
);

// Async thunk for updating driver profile
export const updateDriverProfile = createAsyncThunk(
  "driver/updateProfile",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await driverService.updateDriver(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0] ||
          "Failed to update profile"
      );
    }
  }
);

// Async thunk for creating a new driver
export const createDriver = createAsyncThunk(
  "driver/createDriver",
  async (driverData, { rejectWithValue }) => {
    try {
      const response = await driverService.createDriver(driverData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0] ||
          "Failed to create driver"
      );
    }
  }
);

const initialState = {
  driverStatus: "unavailable",
  location: { latitude: null, longitude: null },
  videoUrl: "",
  loading: false,
  profileLoading: false,
  error: null,
  profileUpdateSuccess: false,
  registrationSuccess: false,
  acceptedRideId: null,
};

const driverSlice = createSlice({
  name: "driver",
  initialState,
  reducers: {
    clearDriverError: (state) => {
      state.error = null;
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    resetSuccessFlags: (state) => {
      state.profileUpdateSuccess = false;
      state.registrationSuccess = false;
    },
    setAcceptedRideId: (state, action) => {
      state.acceptedRideId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update Status and Location
      .addCase(updateDriverStatusAndLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDriverStatusAndLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.driverStatus = action.payload.status;
        if (action.payload.currentLocation) {
          state.location = action.payload.currentLocation;
        }
      })
      .addCase(updateDriverStatusAndLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Driver Video
      .addCase(fetchDriverVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.videoUrl = action.payload.videoUrl || "";
      })
      .addCase(fetchDriverVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Driver Profile
      .addCase(updateDriverProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
        state.profileUpdateSuccess = false;
      })
      .addCase(updateDriverProfile.fulfilled, (state) => {
        state.profileLoading = false;
        state.profileUpdateSuccess = true;
      })
      .addCase(updateDriverProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload;
        state.profileUpdateSuccess = false;
      })

      // Create Driver
      .addCase(createDriver.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(createDriver.fulfilled, (state) => {
        state.profileLoading = false;
        state.registrationSuccess = true;
      })
      .addCase(createDriver.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload;
        state.registrationSuccess = false;
      });
  },
});

export const { clearDriverError, setLocation, resetSuccessFlags, setAcceptedRideId } =
  driverSlice.actions;

export default driverSlice.reducer;
