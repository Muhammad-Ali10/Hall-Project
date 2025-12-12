import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const createBooking = createAsyncThunk('bookings/createBooking', async (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (key === 'idProof' && data[key] instanceof File) {
      formData.append('idProof', data[key]);
    } else if (key !== 'idProof') {
      formData.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
    }
  });
  const response = await api.post('/bookings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
});

export const fetchMyBookings = createAsyncThunk('bookings/fetchMyBookings', async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/bookings/my?${params}`);
  return response.data;
});

export const fetchBookingById = createAsyncThunk('bookings/fetchBookingById', async (id) => {
  const response = await api.get(`/bookings/my/${id}`);
  return response.data;
});

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    currentBooking: null,
    loading: false,
    error: null,
    pagination: null,
  },
  reducers: {
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload.data;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.bookings = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.currentBooking = action.payload.data;
      });
  },
});

export const { clearCurrentBooking } = bookingSlice.actions;
export default bookingSlice.reducer;

