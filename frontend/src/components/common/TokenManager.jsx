import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshTokenIfNeeded, getTimeUntilExpiry, isTokenExpired } from '../../utils/tokenUtils';
import { toast } from 'react-hot-toast';
import { logout, setToken, setUser, triggerLogout, setNavigationFunction } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

// Time in milliseconds between token checks
const TOKEN_CHECK_INTERVAL = 4 * 60 * 1000; // 4 minutes

const TokenManager = () => {
  const dispatch = useDispatch();
  const { token, loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const intervalRef = useRef(null);
  const warningShownRef = useRef(false);
  const isCheckingRef = useRef(false);

  useEffect(() => {
    dispatch(setNavigationFunction(navigate));
  }, [dispatch, navigate]);

  const checkToken = useCallback(async () => {

    isCheckingRef.current = true;

    try {
      // Always get the latest token from localStorage to handle page refreshes
      const currentToken = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      
      
      // If no token, ensure we're logged out
      if (!currentToken) {
        dispatch(triggerLogout(navigate));
        warningShownRef.current = false;
        return;
      }
      
      // If token exists but user is not in Redux state, restore it
      if (currentToken && !token) {
        dispatch(setToken(currentToken));
        if (currentUser) {
          dispatch(setUser(currentUser));
        }
      }
  
      const timeUntilExpiry = getTimeUntilExpiry(currentToken);
      
      // Show warning when token expires in 15 minutes
      if (timeUntilExpiry <= 15 && timeUntilExpiry > 0 && !warningShownRef.current) {
        toast(`Your session will expire in ${Math.ceil(timeUntilExpiry)} minutes. Please save your work.`, {
          icon: ' ',
          duration: 5000,
          position: 'top-right'
        });
        warningShownRef.current = true;
      }
      
      // Try to refresh token if needed
      const refreshed = await refreshTokenIfNeeded(false, navigate);
      
      if (refreshed) {
        warningShownRef.current = false;
      
      // If token is expired, log out the user
        dispatch(triggerLogout(navigate));
      }
      
    } catch (error) {
      console.error(' Error in token check:', error);
    } finally {
      isCheckingRef.current = false;
    }
  }, [token, loading, dispatch]);

  return null;
};

export default TokenManager;