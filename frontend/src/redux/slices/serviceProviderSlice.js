import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchServiceProviders = createAsyncThunk(
  'serviceProviders/fetchServiceProviders',
  async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/service-providers?${params}`);
    return response.data;
  }
);

export const fetchServiceProvidersByCategory = createAsyncThunk(
  'serviceProviders/fetchByCategory',
  async (categories = []) => {
    const params = new URLSearchParams({ categories: categories.join(',') }).toString();
    const response = await api.get(`/service-providers/by-category?${params}`);
    return response.data;
  }
);

const serviceProviderSlice = createSlice({
  name: 'serviceProviders',
  initialState: {
    serviceProviders: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceProviders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchServiceProviders.fulfilled, (state, action) => {
        state.loading = false;
        state.serviceProviders = Array.isArray(action.payload?.data) ? action.payload.data : [];
      })
      .addCase(fetchServiceProviders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to fetch service providers';
        state.serviceProviders = [];
      })
      .addCase(fetchServiceProvidersByCategory.fulfilled, (state, action) => {
        state.serviceProviders = Array.isArray(action.payload?.data) ? action.payload.data : [];
      })
      .addCase(fetchServiceProvidersByCategory.rejected, (state) => {
        state.serviceProviders = [];
      });
  },
});

export default serviceProviderSlice.reducer;

