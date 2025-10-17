import { cartApi } from '@/lib/services/cartApi';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'



export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const data = await cartApi.getCart();
      return data.data.cart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const data = await cartApi.addToCart(productId, quantity);
      return data.data.cart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItemAsync = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const data = await cartApi.updateCartItem(productId, quantity);
      return data.data.cart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const decreaseItemAsync = createAsyncThunk(
  'cart/decreaseItem',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await cartApi.decreaseItem(productId);
      return data.data.cart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await cartApi.removeFromCart(productId);
      return data.data.cart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const data = await cartApi.clearCart();
      return data.data.cart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createOrderAsync = createAsyncThunk(
  'cart/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const data = await cartApi.createOrder(orderData);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItems: {}, // Keep this format for backward compatibility
    items: [], // API format with full product details
    total: 0,
    itemCount: 0,
    loading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    // Local actions for guest users
    addToCart: (state, action) => {
      const { productId } = action.payload;
      if (state.cartItems[productId]) {
        state.cartItems[productId]++;
      } else {
        state.cartItems[productId] = 1;
      }
      state.itemCount += 1;
    },
    removeFromCart: (state, action) => {
      const { productId } = action.payload;
      if (state.cartItems[productId]) {
        state.cartItems[productId]--;
        state.itemCount -= 1;
        if (state.cartItems[productId] === 0) {
          delete state.cartItems[productId];
        }
      }
    },
    deleteItemFromCart: (state, action) => {
      const { productId } = action.payload;
      const quantity = state.cartItems[productId] || 0;
      state.itemCount -= quantity;
      delete state.cartItems[productId];
    },
    clearCart: (state) => {
      state.cartItems = {};
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Convert API items to cartItems format
    syncCartItems: (state) => {
      const cartItems = {};
      state.items.forEach(item => {
        cartItems[item.product._id] = item.quantity;
      });
      state.cartItems = cartItems;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
        state.itemCount = action.payload.itemCount || 0;
        
        // Convert to cartItems format
        const cartItems = {};
        state.items.forEach(item => {
          cartItems[item.product._id] = item.quantity;
        });
        state.cartItems = cartItems;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add to Cart
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
        state.itemCount = action.payload.itemCount || 0;
        
        const cartItems = {};
        state.items.forEach(item => {
          cartItems[item.product._id] = item.quantity;
        });
        state.cartItems = cartItems;
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Cart Item
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
        state.itemCount = action.payload.itemCount || 0;
        
        const cartItems = {};
        state.items.forEach(item => {
          cartItems[item.product._id] = item.quantity;
        });
        state.cartItems = cartItems;
      })
      
      // Decrease Item
      .addCase(decreaseItemAsync.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
        state.itemCount = action.payload.itemCount || 0;
        
        const cartItems = {};
        state.items.forEach(item => {
          cartItems[item.product._id] = item.quantity;
        });
        state.cartItems = cartItems;
      })
      
      // Remove from Cart
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
        state.itemCount = action.payload.itemCount || 0;
        
        const cartItems = {};
        state.items.forEach(item => {
          cartItems[item.product._id] = item.quantity;
        });
        state.cartItems = cartItems;
      })
      
      // Clear Cart
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
        state.cartItems = {};
        state.total = 0;
        state.itemCount = 0;
      })
      
      // Create Order
      .addCase(createOrderAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrderAsync.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.cartItems = {};
        state.total = 0;
        state.itemCount = 0;
      })
      .addCase(createOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart,setAuthenticated,clearError,syncCartItems } = cartSlice.actions

export default cartSlice.reducer
