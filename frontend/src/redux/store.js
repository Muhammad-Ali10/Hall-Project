import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import hallReducer from './slices/hallSlice';
import bookingReducer from './slices/bookingSlice';
import serviceProviderReducer from './slices/serviceProviderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    halls: hallReducer,
    bookings: bookingReducer,
    serviceProviders: serviceProviderReducer,
  },
});

