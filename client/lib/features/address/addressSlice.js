import { createSlice } from '@reduxjs/toolkit'

const persistedAddresses =
  typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('addresses') || '[]')
    : [];

const addressSlice = createSlice({
  name: 'address',
  initialState: {
    list: persistedAddresses,
  },
  reducers: {
    addAddress: (state, action) => {
      state.list.push(action.payload);
      localStorage.setItem('addresses', JSON.stringify(state.list));
    },
    updateAddress: (state, action) => {
      const index = state.list.findIndex(addr => addr.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
        localStorage.setItem('addresses', JSON.stringify(state.list));
      }
    },
    clearAddresses: (state) => {
      state.list = [];
      localStorage.removeItem('addresses');
    }
  }
});

export const { addAddress, updateAddress, clearAddresses } = addressSlice.actions;
export default addressSlice.reducer;
