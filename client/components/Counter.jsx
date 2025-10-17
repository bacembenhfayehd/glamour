'use client'
import { addToCart, addToCartAsync, decreaseItemAsync, removeFromCart } from "@/lib/features/cart/cartSlice";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const Counter = ({ productId,product }) => {

    const { cartItems } = useSelector(state => state.cart);
    const isAuthenticated = useSelector(state => state.cart.isAuthenticated);
const loading = useSelector(state => state.cart.loading);
const quantity = cartItems[productId] || 0;

    const dispatch = useDispatch();

    const addToCartHandler = () => {
       if (quantity >= product.stock) {
    toast.error('Limite de stock atteinte');
    return;
  }
        if (isAuthenticated) {
    dispatch(addToCartAsync({ productId, quantity: 1 }));
  } else {
    dispatch(addToCart({ productId }));
  }
    }

    const removeFromCartHandler = () => {
        if (isAuthenticated) {
    dispatch(decreaseItemAsync(productId));
  } else {
    dispatch(removeFromCart({ productId }));
  }
    }

    return (
        <div className="inline-flex items-center gap-1 sm:gap-3 px-3 py-1 rounded border border-slate-200 max-sm:text-sm text-slate-600">
            <button onClick={removeFromCartHandler} disabled={loading} className="p-1 select-none">-</button>
            <p className="p-1">{cartItems[productId]}</p>
            <button onClick={addToCartHandler} disabled={loading} className="p-1 select-none">+</button>
        </div>
    )
}

export default Counter