import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Get token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// ============ ASYNC THUNKS ============

// Create Order
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Error creating order',
      });
    }
  }
);

// Get User Orders
export const getUserOrders = createAsyncThunk(
  'orders/getUserOrders',
  async ({ page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const params = new URLSearchParams({
        page,
        limit,
        ...(status && { status }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`${API_BASE_URL}/orders/my-orders?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Error fetching user orders',
      });
    }
  }
);

// Get Order by ID
export const getOrderById = createAsyncThunk(
  'orders/getOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Error fetching order',
      });
    }
  }
);

// Cancel Order
export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ orderId, cancelReason }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cancelReason }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Error cancelling order',
      });
    }
  }
);

// Get All Orders (Admin)
export const getAllOrders = createAsyncThunk(
  'orders/getAllOrders',
  async ({ page = 1, limit = 20, status, sortBy = 'createdAt', sortOrder = 'desc' }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const params = new URLSearchParams({
        page,
        limit,
        ...(status && { status }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`${API_BASE_URL}/orders?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Error fetching all orders',
      });
    }
  }
);

// Update Order Status (Admin)
export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status, cancelReason }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status, ...(cancelReason && { cancelReason }) }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Error updating order status',
      });
    }
  }
);

// Get Order Stats (Admin)
export const getOrderStats = createAsyncThunk(
  'orders/getOrderStats',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/orders/stats/overview`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Error fetching order stats',
      });
    }
  }
);

// ============ SLICE ============

const initialState = {
  // Single order
  currentOrder: null,
  
  // User orders
  userOrders: [],
  userOrdersPagination: {
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false,
  },

  // All orders (admin)
  allOrders: [],
  allOrdersPagination: {
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false,
  },

  // Order stats (admin)
  stats: {
    statusStats: [],
    totalOrders: 0,
    totalRevenue: 0,
  },

  // Loading states
  loading: false,
  loadingCreateOrder: false,
  loadingGetOrder: false,
  loadingCancelOrder: false,
  loadingUpdateStatus: false,
  loadingStats: false,

  // Error handling
  error: null,
  errorCreateOrder: null,
  errorGetOrder: null,
  errorCancelOrder: null,
  errorUpdateStatus: null,
  errorStats: null,

  // Success states
  successCreateOrder: false,
  successCancelOrder: false,
  successUpdateStatus: false,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.errorCreateOrder = null;
      state.errorGetOrder = null;
      state.errorCancelOrder = null;
      state.errorUpdateStatus = null;
      state.errorStats = null;
    },
    
    // Clear success states
    clearSuccesses: (state) => {
      state.successCreateOrder = false;
      state.successCancelOrder = false;
      state.successUpdateStatus = false;
    },

    // Reset current order
    resetCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },

  extraReducers: (builder) => {
    // ========== CREATE ORDER ==========
    builder.addCase(createOrder.pending, (state) => {
      state.loadingCreateOrder = true;
      state.errorCreateOrder = null;
      state.successCreateOrder = false;
    });
    builder.addCase(createOrder.fulfilled, (state, action) => {
      state.loadingCreateOrder = false;
      state.currentOrder = action.payload.data || action.payload;
      state.successCreateOrder = true;
      state.errorCreateOrder = null;
    });
    builder.addCase(createOrder.rejected, (state, action) => {
      state.loadingCreateOrder = false;
      state.errorCreateOrder = action.payload?.message || 'Error creating order';
      state.successCreateOrder = false;
    });

    // ========== GET USER ORDERS ==========
    builder.addCase(getUserOrders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getUserOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.userOrders = action.payload.data?.orders || action.payload.orders || [];
      if (action.payload.data?.pagination) {
        state.userOrdersPagination = action.payload.data.pagination;
      } else if (action.payload.pagination) {
        state.userOrdersPagination = action.payload.pagination;
      }
      state.error = null;
    });
    builder.addCase(getUserOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Error fetching orders';
    });

    // ========== GET ORDER BY ID ==========
    builder.addCase(getOrderById.pending, (state) => {
      state.loadingGetOrder = true;
      state.errorGetOrder = null;
    });
    builder.addCase(getOrderById.fulfilled, (state, action) => {
      state.loadingGetOrder = false;
      state.currentOrder = action.payload.data || action.payload;
      state.errorGetOrder = null;
    });
    builder.addCase(getOrderById.rejected, (state, action) => {
      state.loadingGetOrder = false;
      state.errorGetOrder = action.payload?.message || 'Error fetching order';
    });

    // ========== CANCEL ORDER ==========
    builder.addCase(cancelOrder.pending, (state) => {
      state.loadingCancelOrder = true;
      state.errorCancelOrder = null;
      state.successCancelOrder = false;
    });
    builder.addCase(cancelOrder.fulfilled, (state, action) => {
      state.loadingCancelOrder = false;
      const cancelledOrder = action.payload.data || action.payload;
      state.currentOrder = cancelledOrder;
      
      // Update in user orders list
      const index = state.userOrders.findIndex(o => o._id === cancelledOrder._id);
      if (index !== -1) {
        state.userOrders[index] = cancelledOrder;
      }
      
      state.successCancelOrder = true;
      state.errorCancelOrder = null;
    });
    builder.addCase(cancelOrder.rejected, (state, action) => {
      state.loadingCancelOrder = false;
      state.errorCancelOrder = action.payload?.message || 'Error cancelling order';
      state.successCancelOrder = false;
    });

    // ========== GET ALL ORDERS (ADMIN) ==========
    builder.addCase(getAllOrders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAllOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.allOrders = action.payload.data?.orders || action.payload.orders || [];
      if (action.payload.data?.pagination) {
        state.allOrdersPagination = action.payload.data.pagination;
      } else if (action.payload.pagination) {
        state.allOrdersPagination = action.payload.pagination;
      }
      state.error = null;
    });
    builder.addCase(getAllOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Error fetching all orders';
    });

    // ========== UPDATE ORDER STATUS (ADMIN) ==========
    builder.addCase(updateOrderStatus.pending, (state) => {
      state.loadingUpdateStatus = true;
      state.errorUpdateStatus = null;
      state.successUpdateStatus = false;
    });
    builder.addCase(updateOrderStatus.fulfilled, (state, action) => {
      state.loadingUpdateStatus = false;
      const updatedOrder = action.payload.data || action.payload;
      state.currentOrder = updatedOrder;
      
      // Update in all orders list
      const index = state.allOrders.findIndex(o => o._id === updatedOrder._id);
      if (index !== -1) {
        state.allOrders[index] = updatedOrder;
      }
      
      state.successUpdateStatus = true;
      state.errorUpdateStatus = null;
    });
    builder.addCase(updateOrderStatus.rejected, (state, action) => {
      state.loadingUpdateStatus = false;
      state.errorUpdateStatus = action.payload?.message || 'Error updating order status';
      state.successUpdateStatus = false;
    });

    // ========== GET ORDER STATS (ADMIN) ==========
    builder.addCase(getOrderStats.pending, (state) => {
      state.loadingStats = true;
      state.errorStats = null;
    });
    builder.addCase(getOrderStats.fulfilled, (state, action) => {
      state.loadingStats = false;
      state.stats = action.payload.data || action.payload;
      state.errorStats = null;
    });
    builder.addCase(getOrderStats.rejected, (state, action) => {
      state.loadingStats = false;
      state.errorStats = action.payload?.message || 'Error fetching stats';
    });
  },
});

export const { clearErrors, clearSuccesses, resetCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;