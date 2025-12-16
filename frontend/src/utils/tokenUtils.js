import jwtDecode from 'jwt-decode';
import { store } from "../store";
import { triggerLogout } from "../store/slices/authSlice";

// Token storage functions
export const getToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token from localStorage:', error);
    return null;
  }
};

export const setToken = (token) => {
  try {
    localStorage.setItem('token', token);
  } catch (error) {
    console.error('Error saving token to localStorage:', error);
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error removing token from localStorage:', error);
  }
};

// Check if token is expired or will expire soon
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    return timeUntilExpiry < 300; // 5 minutes in seconds
  } catch (error) {
    return true;
  }
};

export const isTokenExpiringSoon = (token) => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    return timeUntilExpiry < 1800; // 30 minutes in seconds
  } catch (error) {
    return true;
  }
};

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

export const refreshTokenIfNeeded = async (forceRefresh = false, navigate = null) => {
  try {
    // Get tokens from both Redux state and localStorage for redundancy
    const state = store.getState();
    const token = state.auth?.token || localStorage.getItem('token');
    const refreshTokenValue = localStorage.getItem('refreshToken');
    
    console.log(' Token check:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      hasRefreshToken: !!refreshTokenValue,
      refreshTokenLength: refreshTokenValue?.length || 0,
      isExpiringSoon: isTokenExpiringSoon(token),
      isExpired: isTokenExpired(token),
      forceRefresh: forceRefresh
    });
    
    // If we don't have a refresh token, we can't refresh
    if (!refreshTokenValue) {
      console.error(' No refresh token available in localStorage');
      // Clear any invalid tokens
      if (token) {
        localStorage.removeItem('token');
      }
      return false;
    }
    
    // If we don't have a token, it's expired, expiring soon, or we're forcing a refresh
    const needsRefresh = forceRefresh || !token || isTokenExpiringSoon(token) || isTokenExpired(token);
    
    if (!needsRefresh) {
      console.log(' Token still valid, no refresh needed');
      return true;
    }
    
    console.log(' Token needs refresh');
    
    // If we're already refreshing, wait for the result
    if (isRefreshing) {
      console.log(' Already refreshing, adding to queue...');
      return new Promise((resolve) => {
        refreshSubscribers.push((success) => {
          console.log(' Resolving queued refresh request');
          resolve(success);
        });
      });
    }
    
    isRefreshing = true;
    console.log(' Starting token refresh...');
    
    // Use dynamic import to avoid circular dependencies
    const { refreshToken: refreshTokenAction } = await import("../services/operations/authApi");
    
    // Dispatch the refresh token action
    console.log(' Dispatching refreshToken action...');
    const action = await store.dispatch(refreshTokenAction(refreshTokenValue, navigate));
    const result = action.payload || action;
    
    if (!result?.success) {
      throw new Error(result?.message || 'Failed to refresh token');
    }
    
    console.log(' Token refresh successful');
    
    // Update tokens in localStorage and Redux
    if (result.accessToken) {
      localStorage.setItem('token', result.accessToken);
      store.dispatch({
        type: 'auth/setToken',
        payload: result.accessToken
      });
    }
    
    if (result.refreshToken) {
      localStorage.setItem('refreshToken', result.refreshToken);
    }
    
    if (result.user) {
      localStorage.setItem('user', JSON.stringify(result.user));
      store.dispatch({
        type: 'auth/setUser',
        payload: result.user
      });
    }
    
    onRefreshed(true);
    return true;
    
  } catch (error) {
    console.error(' Token refresh failed:', error.message);
    
    // Clear invalid tokens
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Reset auth state
    store.dispatch({ type: 'auth/setToken', payload: null });
    store.dispatch({ type: 'auth/setUser', payload: null });
    
    // Only attempt logout if we're not already on the login page
    if (!window.location.pathname.includes('/login')) {
      // Use the global logout trigger from authSlice, passing undefined for navigate initially
      store.dispatch(triggerLogout(navigate));
    }
    
    onRefreshed(false);
    return false;
    
  } finally {
    isRefreshing = false;
    console.log(' Refresh process completed');
  }
};

export const getTokenExpirationTime = (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

export const getTimeUntilExpiry = (token) => {
  if (!token) return 0;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    return Math.max(0, Math.floor(timeUntilExpiry / 60));
  } catch (error) {
    return 0;
  }
};
// REMOVE THE DUPLICATE refreshToken FUNCTION BELOW THIS LINE