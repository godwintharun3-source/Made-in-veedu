import { createSlice } from '@reduxjs/toolkit';

const initialUser = localStorage.getItem('miv_user')
  ? JSON.parse(localStorage.getItem('miv_user'))
  : null;
const initialAccessToken = localStorage.getItem('miv_access_token') || null;
const initialRefreshToken = localStorage.getItem('miv_refresh_token') || null;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    accessToken: initialAccessToken,
    refreshToken: initialRefreshToken,
    isAuthenticated: !!initialAccessToken,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, refreshToken, user } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.user = user;
      state.isAuthenticated = true;

      localStorage.setItem('miv_access_token', accessToken);
      localStorage.setItem('miv_refresh_token', refreshToken);
      localStorage.setItem('miv_user', JSON.stringify(user));
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('miv_user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;

      localStorage.removeItem('miv_access_token');
      localStorage.removeItem('miv_refresh_token');
      localStorage.removeItem('miv_user');
    },
  },
});

export const { setCredentials, updateUserProfile, logout } = authSlice.actions;
export default authSlice.reducer;
