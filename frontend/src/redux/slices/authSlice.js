import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const sendOTP = createAsyncThunk('auth/sendOTP', async (phone) => {
  const response = await api.post('/auth/customer/send-otp', { phone });
  return response.data;
});

export const verifyOTP = createAsyncThunk('auth/verifyOTP', async ({ phone, otp }) => {
  const response = await api.post('/auth/customer/verify-otp', { phone, otp });
  return response.data;
});

export const hallLogin = createAsyncThunk('auth/hallLogin', async ({ email, password }) => {
  const response = await api.post('/auth/hall/login', { email, password });
  return response.data;
});

export const serviceProviderLogin = createAsyncThunk('auth/serviceProviderLogin', async ({ email, password }) => {
  const response = await api.post('/auth/service-provider/login', { email, password });
  return response.data;
});

export const adminLogin = createAsyncThunk('auth/adminLogin', async ({ email, password }) => {
  const response = await api.post('/auth/admin/login', { email, password });
  return response.data;
});

export const hallRegister = createAsyncThunk('auth/hallRegister', async (data) => {
  // Check if data is FormData
  const isFormData = data instanceof FormData;
  const config = isFormData
    ? {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    : {};
  const response = await api.post('/auth/hall/register', data, config);
  return response.data;
});

export const serviceProviderRegister = createAsyncThunk(
  'auth/serviceProviderRegister',
  async (formData) => {
    const response = await api.post('/auth/service-provider/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
);

export const getCurrentUser = createAsyncThunk('auth/getCurrentUser', async () => {
  const response = await api.get('/auth/me');
  return response.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(hallLogin.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(hallRegister.fulfilled, (state, action) => {
        // Registration doesn't automatically log in
      })
      .addCase(serviceProviderRegister.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(serviceProviderLogin.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;

