'use client'

import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setAuthenticated, fetchCart, clearCart } from '@/lib/features/cart/cartSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const hasRun = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const isAuth = !!token;

      dispatch(setAuthenticated(isAuth));

      if (isAuth) {
        try {
          await dispatch(fetchCart()).unwrap();
        } catch (error) {
          console.error('Failed to fetch cart:', error);
          dispatch(setAuthenticated(false));
        }
      } else {
        // User logged out - clear API cart state but keep guest cart
        dispatch(clearCart());
      }
    };

    initAuth();
  }, []); // Empty dependency - runs only once on mount

  // Listen for storage changes (token added/removed)
  useEffect(() => {
    const handleStorageChange = async (e) => {
      // Storage event fires when OTHER tabs change localStorage
      if (e.key === 'accessToken') {
        const token = e.newValue;
        const isAuth = !!token;

        dispatch(setAuthenticated(isAuth));

        if (isAuth) {
          try {
            await dispatch(fetchCart()).unwrap();
          } catch (error) {
            console.error('Failed to fetch cart:', error);
          }
        } else {
          dispatch(clearCart());
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch]);

  // Listen for custom events from login/logout (SAME TAB)
useEffect(() => {
  const handleAuthChange = async (e) => {
    const { isAuthenticated: isAuth } = e.detail;
    
    if (isAuth) {
      // Merge guest cart on login
      try {
        const guestCart = JSON.parse(localStorage.getItem('persist:root') || '{}');
        const cartState = JSON.parse(guestCart.cart || '{}');
        const guestItems = cartState.cartItems || {};
        
        dispatch(setAuthenticated(true));
        await dispatch(fetchCart()).unwrap();
        
        if (Object.keys(guestItems).length > 0) {
          for (const [productId, quantity] of Object.entries(guestItems)) {
            try {
              await dispatch(addToCartAsync({ productId, quantity })).unwrap();
            } catch (error) {
              console.error(`Failed to add product ${productId}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('Failed to sync cart:', error);
      }
    } else {
      // Logout - keep Redux persist (guest cart stays)
      dispatch(setAuthenticated(false));
      // Don't call clearCart() - it wipes everything
    }
  };
  
  window.addEventListener('authChange', handleAuthChange);
  return () => window.removeEventListener('authChange', handleAuthChange);
}, [dispatch]);
};
