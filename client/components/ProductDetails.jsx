'use client'

import { addToCart, addToCartAsync } from "@/lib/features/cart/cartSlice";
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

const ProductDetails = ({ product }) => {

    const productId = product._id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'DT';

    const cart = useSelector(state => state.cart.cartItems);
    const isAuthenticated = useSelector(state => state.cart.isAuthenticated);
const loading = useSelector(state => state.cart.loading);
const error = useSelector(state => state.cart.error);
    const dispatch = useDispatch();
    const [stockStatus, setStockStatus] = useState({
    isLow: product.stock > 0 && product.stock <= 100,
    isOut: product.stock === 0
});

    const router = useRouter()

    const [mainImage, setMainImage] = useState(product.images[0].url);

    const addToCartHandler = async () => {
  try {
    if (isAuthenticated) {
      await dispatch(addToCartAsync({ productId, quantity: 1 })).unwrap();
      toast.success('Produit ajouté au panier');
    } else {
      dispatch(addToCart({ productId }));
      toast.success('Produit ajouté au panier');
    }
  } catch (err) {
    toast.error(err || 'Erreur lors de l\'ajout au panier');
  }
};

    const averageRating = product.rating && product.rating.length > 0 
    ? product.rating.reduce((acc, item) => acc + item.rating, 0) / product.rating.length 
    : 0;
    const mrp = product.mrp || product.price * 1.2;
    return (
        <div className="flex max-lg:flex-col gap-12">
            <div className="flex max-sm:flex-col-reverse gap-3">
                <div className="flex sm:flex-col gap-3">
                    {product.images.map((image, index) => (
                        <div key={index} onClick={() => setMainImage(product.images[index].url)} className="bg-slate-100 flex items-center justify-center size-26 rounded-lg group cursor-pointer">
                            <Image src={image.url} className="group-hover:scale-103 group-active:scale-95 transition" alt="" width={45} height={45} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-100 rounded-lg ">
                    <Image src={mainImage} alt="" width={250} height={250} />
                </div>
            </div>
            <div className="flex-1">
                <h1 className="text-3xl font-semibold text-slate-800">{product.name}</h1>
                <div className='flex items-center mt-2'>
                    {Array(5).fill('').map((_, index) => (
                        <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                    ))}
                    <p className="text-sm ml-3 text-slate-500">{product.rating?.length || 0} Reviews</p>
                </div>
                <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
                    <p> {currency}{product.price} </p>
                    <p className="text-xl text-slate-500 line-through">{currency}{mrp}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                    <TagIcon size={14} />
                    <p>Économisez {((mrp - product.price) / mrp * 100).toFixed(0)}% dès maintenant</p>
                </div>
                <div className="flex items-end gap-5 mt-10">
    {cart[productId] && (
        <div className="flex flex-col gap-3">
            <p className="text-lg text-slate-800 font-semibold">Quantité</p>
            <Counter productId={productId} product={product} />
        </div>
    )}
    
    <button 
        onClick={() => !cart[productId] ? addToCartHandler() : router.push('/cart')} 
        disabled={loading || stockStatus.isOut} 
        className={`px-10 py-3 text-sm font-medium rounded transition ${
            stockStatus.isOut 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-slate-800 text-white hover:bg-slate-900 active:scale-95'
        }`}
    >
        {loading ? 'Chargement...' : (
            stockStatus.isOut ? 'Rupture de stock' : (
                !cart[productId] ? 'Ajouter au panier' : 'Voir le panier'
            )
        )}
    </button>
                    {error && (
  <p className="text-red-500 text-sm mt-2">{error}</p>
)}{stockStatus.isOut && (
    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg mt-4">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <p className="text-sm text-red-600 font-medium">
            Produit actuellement indisponible
        </p>
    </div>
)}

{stockStatus.isLow && !stockStatus.isOut && (
    <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg mt-4">
        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
        <p className="text-sm text-orange-600 font-medium">
            Plus que {product.stock} en stock - Commandez vite !
        </p>
    </div>
)}
                </div>
                <hr className="border-gray-300 my-5" />
                <div className="flex flex-col gap-4 text-slate-500">
                    <p className="flex gap-3"> <EarthIcon className="text-slate-400" /> Livraison gratuite</p>
                    <p className="flex gap-3"> <CreditCardIcon className="text-slate-400" /> Paiement 100 % sécurisé </p>
                    <p className="flex gap-3"> <UserIcon className="text-slate-400" /> Approuvée par de nombreux clients </p>
                </div>

            </div>
        </div>
    )
}

export default ProductDetails