"use client";
import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import {
  deleteItemFromCart,
  removeFromCartAsync,
} from "@/lib/features/cart/cartSlice";
import { Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

export default function Cart() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "DT";

  const { cartItems, items, total, loading, isAuthenticated } = useSelector(
    (state) => state.cart
  );
  const products = useSelector((state) => state.product.list);

  const dispatch = useDispatch();

  const [cartArray, setCartArray] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const createCartArray = () => {
  // ALWAYS check isAuthenticated first
  if (isAuthenticated && items.length > 0) {
    // Use API cart for authenticated users
    setCartArray(
      items
        .filter((item) => item.product)
        .map((item) => ({
          ...item.product,
          quantity: item.quantity,
        }))
    );
    setTotalPrice(total);
  } else if (!isAuthenticated && Object.keys(cartItems).length > 0 && products.length > 0) {
    // Use local cart only for guests AND only if products are loaded
    setTotalPrice(0);
    const cartArray = [];
    for (const [key, value] of Object.entries(cartItems)) {
      const product = products.find((product) => product._id === key);
      if (product) {
        cartArray.push({
          ...product,
          quantity: value,
        });
        setTotalPrice((prev) => prev + product.price * value);
      }
    }
    setCartArray(cartArray);
  } else {
    // Empty cart
    setCartArray([]);
    setTotalPrice(0);
  }
};


  const handleDeleteItemFromCart = async (productId) => {
    try {
      if (isAuthenticated) {
        await dispatch(removeFromCartAsync(productId)).unwrap();
        toast.success("Produit supprimé du panier");
      } else {
        dispatch(deleteItemFromCart({ productId }));
        toast.success("Produit supprimé du panier");
      
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (items.length > 0) {
        createCartArray();
      }
    } else if (products.length > 0) {
      createCartArray();
    }
  }, [cartItems, products, items, isAuthenticated,total]);

  const isEmpty = isAuthenticated 
  ? items.length === 0 
  : Object.keys(cartItems).length === 0;

  return !isEmpty ? (
    <div className="min-h-screen mx-6 text-slate-800">
      <div className="max-w-7xl mx-auto ">
        {/* Title */}
        <PageTitle
          heading="Panier"
          text={`${cartArray.length} Articles dans la panier`}
          linkText="Ajouter plus"
        />

        <div className="flex items-start justify-between gap-5 max-lg:flex-col">
          <table className="w-full max-w-4xl text-slate-600 table-auto">
            <thead>
              <tr className="max-sm:text-sm">
                <th className="text-left">Produit</th>
                <th>Quantité</th>
                <th>Prix total</th>
                <th className="max-md:hidden">Supprimer</th>
              </tr>
            </thead>
            <tbody>
              {cartArray.map((item, index) => (
                <tr key={index} className="space-x-2">
                  <td className="flex gap-3 my-4">
                    <div className="flex gap-3 items-center justify-center bg-slate-100 size-18 rounded-md">
                      <Image
                        src={item.images[0].url}
                        className="h-14 w-auto"
                        alt=""
                        width={45}
                        height={45}
                      />
                    </div>
                    <div>
                      <p className="max-sm:text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.category}</p>
                      <p>
                        {currency}
                        {item.price}
                      </p>
                    </div>
                  </td>
                  <td className="text-center">
                    <Counter productId={item._id} product={item} />
                  </td>
                  <td className="text-center">
                    {currency}
                    {(item.price * item.quantity).toLocaleString()}
                  </td>
                  <td className="text-center max-md:hidden">
                    <button
                      onClick={() => handleDeleteItemFromCart(item._id)}
                      disabled={loading}
                      className=" text-red-500 hover:bg-red-50 p-2.5 rounded-full active:scale-95 transition-all"
                    >
                      <Trash2Icon size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <OrderSummary totalPrice={totalPrice} items={cartArray} />
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
      <h1 className="text-2xl sm:text-4xl font-semibold">
        Votre panier est vide !
      </h1>
    </div>
  );
}
