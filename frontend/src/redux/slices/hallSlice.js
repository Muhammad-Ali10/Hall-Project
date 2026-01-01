import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchHalls = createAsyncThunk('halls/fetchHalls', async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/halls?${params}`);
  return response.data;
});

export const fetchHallById = createAsyncThunk('halls/fetchHallById', async (id) => {
  const response = await api.get(`/halls/${id}`, {
    params: {
      _t: Date.now() // Cache buster
    },
    headers: {
      'Cache-Control': 'no-cache'
    }
  });
  return response.data;
});

export const fetchTopHalls = createAsyncThunk('halls/fetchTopHalls', async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/halls/top?${params}`);
  return response.data;
});

const hallSlice = createSlice({
  name: 'halls',
  initialState: {
    halls: [],
    topHalls: [],
    currentHall: null,
    loading: false,
    error: null,
    pagination: null,
  },
  reducers: {
    clearCurrentHall: (state) => {
      state.currentHall = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHalls.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHalls.fulfilled, (state, action) => {
        state.loading = false;
        state.halls = Array.isArray(action.payload?.data) ? action.payload.data : [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchHalls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to fetch halls';
        state.halls = [];
        state.pagination = null;
      })
      .addCase(fetchHallById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHallById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentHall = action.payload?.data || null;
      })
      .addCase(fetchHallById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to fetch hall';
        state.currentHall = null;
      })
      .addCase(fetchTopHalls.fulfilled, (state, action) => {
        state.topHalls = Array.isArray(action.payload?.data) ? action.payload.data : [];
      })
      .addCase(fetchTopHalls.rejected, (state) => {
        state.topHalls = [];
      });
  },
});

export const { clearCurrentHall } = hallSlice.actions;
export default hallSlice.reducer;

