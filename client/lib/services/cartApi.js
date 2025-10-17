// lib/services/cartApi.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const cartApi = {
  getCart: async () => {
    const response = await fetch(`${API_URL}/cart`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch cart');
    return response.json();
  },

  addToCart: async (productId, quantity = 1) => {
    const response = await fetch(`${API_URL}/cart/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ product: productId, quantity })
    });
    if (!response.ok) throw new Error('Failed to add to cart');
    return response.json();
  },

  updateCartItem: async (productId, quantity) => {
    const response = await fetch(`${API_URL}/cart/item/${productId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity })
    });
    if (!response.ok) throw new Error('Failed to update cart item');
    return response.json();
  },

  decreaseItem: async (productId) => {
    const response = await fetch(`${API_URL}/cart/item/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to decrease item');
    return response.json();
  },

  removeFromCart: async (productId) => {
    const response = await fetch(`${API_URL}/cart/remove/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to remove from cart');
    return response.json();
  },

  clearCart: async () => {
    const response = await fetch(`${API_URL}/cart/clear`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to clear cart');
    return response.json();
  },

  createOrder: async (orderData) => {
    const response = await fetch(`${API_URL}/cart/checkout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
  }
};