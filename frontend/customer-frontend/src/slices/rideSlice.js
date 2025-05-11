import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rideHistory: [],
  predictedPrice: null,
  selectedRide: null,
};

const rideSlice = createSlice({
  name: 'ride',
  initialState,
  reducers: {
    setRideHistory(state, action) {
      state.rideHistory = action.payload;
    },
    setPredictedPrice(state, action) {
      state.predictedPrice = action.payload;
    },
    setSelectedRide(state, action) {
      state.selectedRide = action.payload;
    },
    clearSelectedRide(state) {
      state.selectedRide = null;
    },
  },
});

export const { setRideHistory, setPredictedPrice, setSelectedRide, clearSelectedRide } = rideSlice.actions;
export default rideSlice.reducer; 